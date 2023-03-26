package plugins.org.rd.plugin.openai

@Grab(group='io.github.http-builder-ng', module='http-builder-ng-core', version='1.0.4', initClass=false)

import org.slf4j.Logger
import org.slf4j.LoggerFactory

import java.nio.file.Files
import java.nio.file.Path
import java.io.FileInputStream
import java.io.BufferedInputStream

import java.nio.file.StandardCopyOption

import groovy.json.JsonSlurper

import groovyx.net.http.HttpBuilder
import groovyx.net.http.ContentTypes 
import static groovyx.net.http.HttpBuilder.configure
import groovyx.net.http.optional.Download



class GenerativeContentServices {

    private static final Logger logger = LoggerFactory.getLogger(GenerativeContentServices.class)

    def audioVideoServices 
    def aiServices

    /**
     * plugin config constructor
     */
    def GenerativeContentServices(pluginConfig) {
        audioVideoServices = new AudioVideoServices(pluginConfig)
        aiServices = new AiServices(pluginConfig)
    }    

    def generateVideoFromUrl(contentUrl, mainIdea) {
        
        // capture sentences form the page
        def htmlPage = httpGet(contentUrl)
        def nodes = htmlPage.body.childNodes()

         def sourceText = ""
         def nonTextTags = ["nav", "header", "footer", "#comment", "svg", "script", "noscript", "style", "iframe", "audio", "video", "img", "a", "video"]

        nodes.each { node ->
            def nodeName = node.nodeName().toLowerCase()
            if(!nonTextTags.contains(nodeName)) {
                sourceText += node.toString()
            }
        }

        // strip tages
        sourceText = sourceText.replaceAll("<[^>]*>", "")

        // strip whitespace
        sourceText = sourceText.replaceAll("\n", " ")
        sourceText = sourceText.replaceAll("\t", " ")
        sourceText = sourceText.replaceAll("  ", " ")
        sourceText = sourceText.replaceAll("&nbsp;", " ")

        // prepare movie
        def slideDefinitions = generateVideoFromText(sourceText, mainIdea)

        return slideDefinitions
    }

    /**
     * prepare a video from text
     */
    def generateVideoFromText(sourceText, mainSubject) {
        def sentences = sourceText.split("(?<=[.?!]) ");
  
        // generate slide defimitions
        def slideDefinitions = generateSlideDefinitions(sentences, mainSubject)
  
        return slideDefinitions
    }

    def getFinalDownload(id) {
        def dir = Files.createTempDirectory(path).getParent();    
        def finalFile = dir.resolve("movie-work"+id+"/final.mp4").toFIle()
        def finalFileInputStream = new BufferedInputStream(new FileInputStream(finalFile))
        return finalFileInputStream
    }

    /**
     * use slide definitions to construct video
     */
    def prepareMovie(slideDefinitions) {
        def finalVideoUrl = "done"

        // create and temp folder with image and audio assets
        def slideIndex = 0
        def fullAudioText = ""
        def path = "movie-work"
        Path dir = Files.createTempDirectory(path);
        
        def moveId = dir.toFile().getName()
        moveId = moveId.replace(path, "")

        slideDefinitions.each { slide -> 
            
            // write audio fragment
            def audioResult = generateAudioDownloadUrlForText(slide.text)
            def audioInputstream = audioResult.getAudioStream()
            def audioPath = dir.resolve("audio-seg-" + slideIndex + ".mp3")
            Files.copy(audioInputstream, audioPath, StandardCopyOption.REPLACE_EXISTING);
        
            // get slide durion based on aduio
            slide.duration = audioVideoServices.determineLengthOfAudio(dir, audioPath)

            // download audio to temp folder    
            def imagePath = dir.resolve("image-" + slideIndex + ".png")
            def imageInputstream = HttpBuilder.configure { request.raw = slide.image }.get {
                Download.toFile(delegate, imagePath.toFile())
            }

            slideIndex++
            fullAudioText += slide.text + " " 
        }

        // generate and download the full audio
        def fullAudioResult = generateAudioDownloadUrlForText(fullAudioText)
        def fullAudioInputstream = fullAudioResult.getAudioStream()
        def fullAudioPath = dir.resolve("audio-full.mp3")
        Files.copy(fullAudioInputstream, fullAudioPath, StandardCopyOption.REPLACE_EXISTING)

        // create mp4 version of audio
        audioVideoServices.convertMp3ToMp4(dir)
        def fullAudioAsMp4Path = dir.resolve("audio-full-converted.mp4")

        // generate stiched video (writes the mp4)
        def stitchedVideoPath = dir.resolve("image-stich.mp4")
        audioVideoServices.generateVideoBySequenceImages(dir, stitchedVideoPath, slideDefinitions) 
        
        // // combine audio and video for final video
        def finalVideoPath = dir.resolve("final.mp4")
        audioVideoServices.addAudioToVideo(stitchedVideoPath, fullAudioAsMp4Path, finalVideoPath)
        
        return moveId
    }

    /**
     * based on sentence text, genetrate video and audio
     */
    def generateSlideDefinitions(sentences, mainSubject) {
        def slides = []
        def slideTextGroups = sentences.collate(1)

        slideTextGroups.each{ textGroup ->
            def slide = [:]
            def text = textGroup.join(" ")

            // set slide text
            slide.text = text

            // distill text
            slide.distillation = aiServices.doDistillation(text)

            logger.debug("Text: "+text)
            logger.debug("Grok: "+slide.distillation)

            // set slide image
            slide.image = null
            slides.add(slide)
        }

        return slides
    }

    /**
     * given text generate a image url
     */
    def generateImageDownloadUrlForText(text) {
        def image = null

        try {
            image = aiServices.doImageGeneration(text)
        }
        catch(err) {
            logger.error("Image request failed :" + err)
        }

        return image
    }

    /**
     * given text generate a audio url
     */
    def generateAudioDownloadUrlForText(text) {
        def audio = null

        try {
            audio = aiServices.doTextToSpeech(text)
        }
        catch(err) {
            logger.debug("Audio request failed :" + err)
        }
       
        return audio   
    }

    /**
     * Perform a HTTP Get
     */
    def httpGet(url) {
        def apiUrl = url
        def result = HttpBuilder.configure { request.raw = apiUrl }.get()
    }
}