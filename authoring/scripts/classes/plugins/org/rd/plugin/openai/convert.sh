cd $1
ffmpeg -f lavfi -i color=c=black:s=1280x720:r=5 -i audio-full.mp3 -crf 0 -c:a copy -shortest audio-full-converted.mp4