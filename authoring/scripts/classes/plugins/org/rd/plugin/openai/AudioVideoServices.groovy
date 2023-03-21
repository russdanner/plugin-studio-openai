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
    def determineLengthOfAudio(audioFile) {
        def durationInSeconds = 1

        try {
            def audioInputStream = AudioSystem.getAudioInputStream(audioFile)
            def format = audioInputStream.getFormat()
            def frames = audioInputStream.getFrameLength()
            
            durationInSeconds = (frames+0.0) / format.getFrameRate()  
        }
        catch(err) {
            logger.error("Error getting audio clip length")//, err)
        }

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

        def output = ProcBuilder.run("/home/russdanner/crafter-installs/next/craftercms/crafter-authoring/temp/tomcat/convert.sh", path)
    }

    def addAudioToVideo(sourceVideoPath, sourceAudioPath, outputFilePath) {

        MovieCreator mc = new MovieCreator()
        Movie video = mc.build(sourceVideoPath.toFile().getPath()) 
        Movie audio = mc.build(sourceAudioPath.toFile().getPath())//sourceAudioPath.toFile().getPath()) 
        // MP3TrackImpl audio=new MP3TrackImpl(new FileDataSourceImpl(sourceAudioPath.toFile().getPath()))
        
        List<Track> videoTracks = video.getTracks();
        video.setTracks(new LinkedList<Track>());
        for (Track videoTrack : videoTracks) {
            video.addTrack(new AppendTrack(videoTrack, videoTrack));
        }

        List<Track> audioTracks = audio.getTracks();
        for (Track audioTrack : audioTracks) {
            video.addTrack(new AppendTrack(audioTrack, audioTrack));
        }

        def builder = new DefaultMp4Builder()
        def out = builder.build(video);

        FileOutputStream fos = new FileOutputStream(outputFilePath.toFile());
        out.writeContainer(fos.getChannel())
        fos.close();
    }



    def generateVideoBySequenceImages(folderPath, outputVideoPath) 
    throws Exception {

        SeekableByteChannel out = null;

        try {
            out = NIOUtils.writableFileChannel(outputVideoPath.toFile().getName())
            def encoder = AWTSequenceEncoder.create30Fps(outputVideoPath.toFile())

            if (Files.isDirectory(folderPath)) {
                DirectoryStream<Path> stream = Files.newDirectoryStream(folderPath, "*.png")

                List<File> filesList = new ArrayList<File>();
                for (Path path : stream) {
                    filesList.add(path.toFile());
                }
                File[] files = new File[filesList.size()];
                filesList.toArray(files);

                //sortByNumber(files);

                for (File img : files) {
                    // Generate the image, for Android use Bitmap
                    BufferedImage image = ImageIO.read(img);
                    // Encode the image
                    for(int i=0;i<300;i++) {
                        encoder.encodeImage(image);
                    }

                }
            }
            // Finalize the encoding, i.e. clear the buffers, write the header, etc.
            encoder.finish();
        } finally {
            NIOUtils.closeQuietly(out);
        }
    }
}