package plugins.org.rd.plugin.openai

@Grab(group='io.github.http-builder-ng', module='http-builder-ng-core', version='1.0.4', initClass=false)

import org.slf4j.Logger
import org.slf4j.LoggerFactory

import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardCopyOption

import groovy.json.JsonSlurper

import groovyx.net.http.HttpBuilder
import groovyx.net.http.ContentTypes 
import static groovyx.net.http.HttpBuilder.configure
import groovyx.net.http.optional.Download



class GenerativeContentServices {

    def audioVideoServices 
    def aiServices

    /**
     * plugin config constructor
     */
    def GenerativeContentServices(pluginConfig) {
        audioVideoServices = new AudioVideoServices(pluginConfig)
        aiServices = new AiServices(pluginConfig)
    }    

    /**
     * Generate a video from a URL
     */
    def generateVideoFromUrl(contentUrl) {
        
        // capture sentences form the page
        def htmlPage = httpGet(contentUrl)

        def sourceText = htmlPage.body.toString().replaceAll("<[^>]*>", "")
            sourceText = sourceText.replaceAll("\n", "")
            sourceText = sourceText.replaceAll("\t", "")
            sourceText = sourceText.replaceAll("  ", "")
            sourceText = sourceText.replaceAll("&nbsp;", " ")

        // prepare movie
        def slideDefinitions = generateVideoFromText(sourceText)

        return slideDefinitions
    }

    /**
     * prepare a video from text
     */
    def generateVideoFromText(sourceText) {
        def sentences = sourceText.split("(?<=[.?!]) ");
  
        // generate slide defimitions
        def slideDefinitions = generateSlideDefinitions(sentences)
  
        // prepare movie
        //def videoDownloadUrl = prepareMovie(slideDefinitions)

        return slideDefinitions
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

        slideDefinitions.each { slide -> 
            
            // write audio fragment
            def audioResult = generateAudioDownloadUrlForText(slide.text)
            def audioInputstream = audioResult.getAudioStream()
            def audioPath = dir.resolve("audio-seg-" + slideIndex + ".mp4")
            Files.copy(audioInputstream, audioPath, StandardCopyOption.REPLACE_EXISTING);

            // get slide durion based on aduio
            slide.duration = audioVideoServices.determineLengthOfAudio(audioPath.toFile())

            // download audio to temp folder    
            // get(uri: slide.image, contentType: ContentTypes.BINARY) 
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
        def fullAudioPath = dir.resolve("audio-full.mp4")
        Files.copy(fullAudioInputstream, fullAudioPath, StandardCopyOption.REPLACE_EXISTING);

        // generate stiched video
        def stitchedVideoPath = dir.resolve("image-stich.mp4")
        audioVideoServices.generateVideoBySequenceImages(dir, stitchedVideoPath) 
        //Files.copy(stitchedVideoInputStream, dir, StandardCopyOption.REPLACE_EXISTING);

        // combine audio and video for final video
        def finalVideoPath = dir.resolve("final.mp4")
        audioVideoServices.addAudioToVideo(stitchedVideoPath, fullAudioPath, finalVideoPath)
        
        return finalVideoUrl
    }

    /**
     * based on sentence text, genetrate video and audio
     */
    def generateSlideDefinitions(sentences) {
        def slides = []
        def slideTextGroups = sentences.collate(2)

        slideTextGroups.each{ textGroup ->
            def slide = [:]
            def text = textGroup.join(" ")

            // set slide text
            slide.text = text

            // set slide image
            System.out.println("Generate Image for " + text)
            //slide.image = generateImageDownloadUrlForText(text)

            if(!slide.image) { slide.image = "https://storage.ning.com/topology/rest/1.0/file/get/1557487814?profile=original" }

            // set slide audio
            //slide.audio = generateAudioDownloadUrlForText(text)

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
            def ask = "create an image for \"" + text + "\""
            image = aiServices.doImageGeneration(ask)
        }
        catch(err) {
            System.out.println("Image request failed :" + err)
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
            System.out.println("Audio request failed :" + err)
        }
       
        return audio   
    }

    /**
     * Perform a HTTP Get
     */
    def httpGet(url) {
        def apiUrl = url
        System.out.println("calling API :${apiUrl}")
        def result = HttpBuilder.configure { request.raw = apiUrl }.get()
    }
}