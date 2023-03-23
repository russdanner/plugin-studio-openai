cd $1
RESULT=$(ffmpeg -hide_banner -i $2  dat-$2 2>&1)
DURATION=$(echo $RESULT | grep Duration |  cut -d ',' -f4 | cut -d ' ' -f9)
echo $DURATION
