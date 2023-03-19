package plugins.org.rd.plugin.openai

@Grab(group='org.jcodec', module='jcodec-javase', version='0.2.5', initClass=false)
@Grab(group='com.googlecode.mp4parser', module='isoparser', version='1.1.22', initClass=false)
@Grab(group='org.mp4parser', module='muxer', version='1.9.41', initClass=false)

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
import java.io.FileInputStream

import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardCopyOption

import javax.sound.sampled.AudioSystem


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


    def addAudioToVideo(sourceVideoPath, sourceAudioPath, outputFilePath) {

        System.out.println("Ax0 x")
        MovieCreator mc = new MovieCreator()

def path = "/home/russdanner/crafter-installs/next/craftercms/crafter-authoring/temp/tomcat/movie-work-a"

        System.out.println("Ax01 ")
        Movie video = mc.build(path+"/image-stich.mp4") //sourceVideoPath.getPath())   
        
        System.out.println("Ax02")
        Movie audio = mc.build(path+"/example.mp4") //sourceAudioPath.getPath()) 
        
        
        System.out.println("Ax1")
        List<Track> videoTracks = video.getTracks();

        video.setTracks(new LinkedList<Track>());        
        List<Track> audioTracks = audio.getTracks();
        
        System.out.println("Ax2")
        for (Track videoTrack : videoTracks) {
            video.addTrack(new AppendTrack(videoTrack, videoTrack));
        }

        System.out.println("Ax3")
        for (Track audioTrack : audioTracks) {
            video.addTrack(new AppendTrack(audioTrack, audioTrack));
        }
        
        System.out.println("A")
        def builder = new DefaultMp4Builder()


        System.out.println("A1")
        def out = builder.build(video);


        System.out.println("B")
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
            //Rational.R(25, 1));
            //, Format.MOV, Codec.H264, null);

            //Path directoryPath = Paths.get(folderPath.toFile().toURI())

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
                    System.out.println("Encoding image " + img.getName());
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


    def sortByNumber(File[] files) {
        Arrays.sort(files, new Comparator<File>() {
            @Override
            public int compare(File o1, File o2) {
                int n1 = extractNumber(o1.getName());
                int n2 = extractNumber(o2.getName());
                return n1 - n2;
            }
            private int extractNumber(String name) {
                int i = 0;
                try {
                    int s = name.lastIndexOf('_')+1;
                    int e = name.lastIndexOf('.');
                    String number = name.substring(s, e);
                    i = Integer.parseInt(number);
                } catch(Exception e) {
                    i = 0; // if filename does not match the format then default to 0
                }
                return i;
            }
        }); 
    }

}