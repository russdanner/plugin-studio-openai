package plugins.org.rd.plugin.openai

@Grab(group='org.jcodec', module='jcodec-javase', version='0.2.5', initClass=false)
@Grab(group='com.googlecode.mp4parser', module='isoparser', version='1.1.22', initClass=false)
@Grab(group='org.mp4parser', module='muxer', version='1.9.41', initClass=false)
@Grab(group='com.googlecode.mp4parser', module='isoparser', version='1.1.22', initClass=false)
@Grab(group='com.mpatric', module='mp3agic', version='0.9.1', initClass=false)
@Grab(group='org.buildobjects', module='jproc', version='2.8.2', initClass=false)

import org.slf4j.Logger
import org.slf4j.LoggerFactory

import java.awt.image.BufferedImage;
import java.io.File;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

import javax.imageio.ImageIO;

import org.jcodec.codecs.*;
import org.jcodec.common.Format
import org.jcodec.common.Codec

import org.jcodec.api.awt.AWTSequenceEncoder;
import org.jcodec.common.io.NIOUtils;
import org.jcodec.common.io.SeekableByteChannel;
import org.jcodec.common.model.Rational;

import java.nio.channels.Channels;
import org.mp4parser.IsoFile

import org.mp4parser.muxer.builder.DefaultMp4Builder
import org.mp4parser.muxer.Movie;
import org.mp4parser.muxer.Track;
import org.mp4parser.muxer.container.mp4.MovieCreator;
import org.mp4parser.muxer.tracks.AppendTrack;

import com.googlecode.mp4parser.FileDataSourceImpl
import com.googlecode.mp4parser.authoring.tracks.MP3TrackImpl

import java.io.FileInputStream

import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardCopyOption

import javax.sound.sampled.AudioSystem

import com.mpatric.mp3agic.Mp3File

import org.buildobjects.process.ProcBuilder

class AudioVideoServices {
 
    private static final Logger logger = LoggerFactory.getLogger(AudioVideoServices.class)

    def AudioVideoServices(pluginConfig) {

    }

    /**
     * return length in seconds for audio file 
     */
    def determineLengthOfAudio(dir, audioFile) {
        def durationInSeconds = 1

        def path = dir.toFile().getPath()
        def filename = audioFile.toFile().getName()

        // cd $1
        // RESULT=$(ffmpeg -hide_banner -i $2  dat-$2 2>&1)
        // DURATION=$(echo $RESULT | grep Duration |  cut -d ',' -f4 | cut -d ' ' -f9)
        // echo $DURATION
        def output = ProcBuilder.run("/home/russdanner/crafter-installs/next/craftercms/crafter-authoring/temp/tomcat/duration.sh", path, filename)
        def time = output.trim().split(":")

        def hours = Float.parseFloat(time[0])
        def minutes = Float.parseFloat(time[1])
        def seconds = Float.parseFloat(time[2])

        durationInSeconds = seconds + (minutes * 60) + (hours * 60 * 60) 

        return durationInSeconds
    }


    def cleanMp3(origAudioPath, cleanAudioPath) {
        Mp3File mp3file = new Mp3File(origAudioPath)
    
        if (mp3file.hasId3v1Tag()) {
            mp3file.removeId3v1Tag()
        }
        
        if (mp3file.hasId3v2Tag()) {
            mp3file.removeId3v2Tag()
        }
    
        if (mp3file.hasCustomTag()) {
            mp3file.removeCustomTag()
        }
    
        mp3file.save(cleanAudioPath.toFile().getPath()) 
    }

    def convertMp3ToMp4(sourceDirectoryPath) {
       def path = sourceDirectoryPath.toFile().getPath()

        //convert.sh
        //cd $1
        //ffmpeg -f lavfi -i color=c=black:s=1280x720:r=5 -i audio-full.mp3 -crf 0 -c:a copy -shortest audio-full-converted.mp4

        def output = ProcBuilder.run("/home/russdanner/crafter-installs/next/craftercms/crafter-authoring/temp/tomcat/convert.sh", path)
    }

    def addAudioToVideo(sourceVideoPath, sourceAudioPath, outputFilePath) {

        MovieCreator mc = new MovieCreator()
        Movie video = mc.build(sourceVideoPath.toFile().getPath()) 
        Movie audio = mc.build(sourceAudioPath.toFile().getPath())
        //sourceAudioPath.toFile().getPath()) 
        // MP3TrackImpl audio=new MP3TrackImpl(new FileDataSourceImpl(sourceAudioPath.toFile().getPath()))
        
        // List<Track> videoTracks = video.getTracks();
        // video.setTracks(new LinkedList<Track>());
        // for (Track videoTrack : videoTracks) {
        //     video.addTrack(new AppendTrack(videoTrack, videoTrack));
        // }

        List<Track> audioTracks = audio.getTracks()
        // for (Track audioTrack : audioTracks) {
            video.addTrack(new AppendTrack(audioTracks[1]));
        // }

        def builder = new DefaultMp4Builder()
        def out = builder.build(video);

        FileOutputStream fos = new FileOutputStream(outputFilePath.toFile());
        out.writeContainer(fos.getChannel())
        fos.close();
    }



    def generateVideoBySequenceImages(folderPath, outputVideoPath, slideDefinitions) 
    throws Exception {

        SeekableByteChannel out = null;

        try {
            out = NIOUtils.writableFileChannel(outputVideoPath.toFile().getName())
            def encoder = AWTSequenceEncoder.create30Fps(outputVideoPath.toFile())

            // encode each image at the duration of the audio associated with it
            // we can assume filenames align with the index of the slide
            def index = 0
            slideDefinitions.each { slide ->
                try {
                    def imageFile = folderPath.resolve("image-" + index + ".png").toFile()

                    BufferedImage image = ImageIO.read(imageFile);
                    // Encode the image
                    def FRAMES_PER_SECOND = 30
                    def framesToEncode = FRAMES_PER_SECOND * slide.duration
                    for(int i=0; i < framesToEncode; i++) {
                        encoder.encodeImage(image);
                    }
                }
                catch(encodeErr) {
                    System.out.println("error encoding an image" + index  + " :"+encodeErr)
                }                

                index++
            }

            encoder.finish();
        } finally {
            NIOUtils.closeQuietly(out);
        }
    }
}