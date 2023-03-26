import * as React from 'react';
import { useDispatch } from 'react-redux';
import { get, post, postJSON } from '@craftercms/studio-ui/utils/ajax';
import { map, pluck } from 'rxjs/operators';

import { ChangeEvent, useState } from 'react';
import Skeleton from '@mui/material/Skeleton';
import {
  Box,
  Button,
  Card,
  CardHeader,
  DialogActions,
  DialogContent,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';


import useActiveSiteId from '@craftercms/studio-ui/hooks/useActiveSiteId';
import { ApiResponse, EmptyState, FolderBrowserTreeView, SearchBar, SearchItem } from '@craftercms/studio-ui';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import FormControl from '@mui/material/FormControl';
import CachedRoundedIcon from '@mui/icons-material/CachedRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import { forkJoin } from 'rxjs';



function AnswerSkeletonItem() {
  return (
    <ListItem style={{ height: '25px' }}>
      <Skeleton variant="rectangular" width="20px" />
      <Skeleton variant="text" style={{ margin: '0 10px', width: `${rand(40, 70)}%` }} />
    </ListItem>
  );
}

export function AnswerSkeletonList(props: { numOfItems?: number }) {
  const { numOfItems = 5 } = props;
  const items = new Array(numOfItems).fill(null);
  return (
    <List component="nav" disablePadding>
      {items.map((value, i) => (
        <AnswerSkeletonItem key={i} />
      ))}
    </List>
  );
}

interface AnswerSkeletonProps {
  numOfItems?: number;
  renderBody?: boolean;
}

const AnswerSkeleton = React.memo(({ numOfItems = 5, renderBody = false }: AnswerSkeletonProps) => (
  <div>{renderBody && <AnswerSkeletonList numOfItems={numOfItems} />}</div>
));

export function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function ConvertTextToVideoDialog(props) {
  const dispatch = useDispatch();
  const siteId = useActiveSiteId();
  const [error, setError] = useState();
  const [fetching, setFetching] = useState(false);
  const [generatedContent, setGeneratedContent] = useState([]);
  const [finalDownloadUrl, setFinalDownloadUrl] = useState(null);

  const [mainIdea, setMainIdea] = React.useState('');
  const [commonImageInstructions, setCommonImageInstructions] = React.useState('');
  const [source, setSource] = React.useState('text');  
  const [sourceContent, setSourceContent] = React.useState('');

  const PLUGIN_SERVICE_BASE = '/studio/api/2/plugin/script/plugins/org/rd/plugin/openai/openai';

  const handleSourceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    alert("Text is the only supported source at this time.")
    setSource(event.target.value as string);
  };

  const handleConstructVideo = () => {
    let serviceUrl = `${PLUGIN_SERVICE_BASE}/construct-video.json?siteId=${siteId}`;

    setFetching(true);
    setFinalDownloadUrl(null)

    console.log('post: ' + serviceUrl);
    console.log(generatedContent);

    postJSON(serviceUrl, generatedContent)
      .subscribe({
        next: (response) => {

          setFetching(false);

          console.log(response);          
          let id = (response as any).response.result.id
          setFinalDownloadUrl(`${PLUGIN_SERVICE_BASE}/download-final.json?id=${id}`)

        },
        error({ response }) {
          setFetching(false);

        }
      });
  };

  const handleDistilationUpdate = (value, index) => {
    let slide = generatedContent[index]
    slide.distillation = value

    slide.image = null
    setGeneratedContent([...generatedContent])

    createImage(index, true)
  };


  const handleRegenerateImage = (index) => {
    let slide = generatedContent[index]
    slide.image = null
    setGeneratedContent([...generatedContent])
    setFinalDownloadUrl(null)
    createImage(index)
  };

  const createImage = (index, refine=false) => {

    let slide = generatedContent[index]
    slide.image = null
    setGeneratedContent([...generatedContent])

    let ask = commonImageInstructions + " " + mainIdea + ": " + slide.distillation
    let serviceUrl = `${PLUGIN_SERVICE_BASE}/gentext.json?siteId=${siteId}&ask=${ask}&mode=image&refine=${refine}`;

    get(serviceUrl).subscribe({
      next: (response) => {

        let resultImage = response.response.result[0]

        if(resultImage) {
          slide.image = resultImage

        }
        else {
          slide.image = "/failed"
        }
        setGeneratedContent([...generatedContent])
      },
      error(e) {
        console.log("Issue generating image for prompt "+ask, e)
        slide.image = "/failed"
      }
    });
  }

  const handleGenerate = () => {

    let serviceUrl = `${PLUGIN_SERVICE_BASE}/page-to-video.json?siteId=${siteId}&mainIdea=${mainIdea}&content=${sourceContent}&source=${source}`;
    setFinalDownloadUrl(null)
    setFetching(true);

    get(serviceUrl).subscribe({
      next: (response) => {
        console.log(response.response.result);
        let slides = response.response.result.slides

        // queue slide image creation
        let imageRequests = []
        slides.forEach((slide) => {
          let ask = commonImageInstructions + " " + mainIdea + ": " + slide.distillation
          let serviceUrl = `${PLUGIN_SERVICE_BASE}/gentext.json?siteId=${siteId}&ask=${ask}&mode=image`;
          imageRequests.push(get(serviceUrl))
        })

        // fire slide image creationm
        forkJoin(imageRequests).subscribe(
          (imageResults)  => {
            console.log(imageResults)
            slides.forEach((slide, index) => {
              slide.image = imageResults[index].response.result[0]
            })

            setGeneratedContent([...slides])
            setFetching(false);
          })

        setGeneratedContent(slides);
        setFetching(false);
      },
      error(e) {
        console.error(e);
        setFetching(false);

        setError(
          e.response?.response ?? ({ code: '?', message: 'Unknown Error. Check browser console.' } as ApiResponse)
        );
      }
    });
  };

  const handleDownloadFinal = () => {
    var reportWindow = window.open(finalDownloadUrl);
  }

  const playAudio = (index) => {

  }

  const downloadFromUrlWithJWT = (url) => {
    var postData = new FormData();

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    let csrftoken = "" 
    xhr.setRequestHeader('X-CSRFToken', csrftoken);
    xhr.responseType = 'blob';

    xhr.onload = function (e) {
      var blob = (e.currentTarget as any).response;
      var contentDispo = (e.currentTarget as any).getResponseHeader('Content-Disposition');
      var fileName = contentDispo.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)[1];
      //saveOrOpenBlob(blob, fileName);
    }
    
    xhr.send(postData);
  }

  return (
    <>
      <DialogContent>

      <FormControl margin="normal" fullWidth>
          <TextField  onBlur={(e)=>setMainIdea(e.target.value)}  defaultValue="" id="outlined-basic" label="Main Idea" variant="outlined" />
        </FormControl>

      <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Content Source</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            value={source}
            onChange={handleSourceChange}
          >
            <FormControlLabel value="text" control={<Radio />} label="Text" />
            <FormControlLabel value="content item" control={<Radio />} label="Content" />
            <FormControlLabel value="web" control={<Radio />} label="Web URL" />

          </RadioGroup>
        </FormControl>

        <FormControl margin="normal" fullWidth>
          <TextField defaultValue="" onBlur={(e)=>setSourceContent(e.target.value)} id="outlined-basic" label="Text" variant="outlined" />
        </FormControl>

        <FormControl margin="normal" fullWidth>
          <TextField defaultValue="" onBlur={(e)=>setCommonImageInstructions(e.target.value)} id="outlined-basic" label="Common Image Instructions" variant="outlined" />
        </FormControl>


        <DialogActions>
          <Button onClick={handleGenerate} variant="outlined" sx={{ mr: 1 }}>
            Generate
          </Button>

          <Button disabled={generatedContent.length===0} onClick={handleConstructVideo} variant="outlined" sx={{ mr: 1 }}>
            Construct Video
          </Button>

          <Button disabled={finalDownloadUrl===null} onClick={handleDownloadFinal} variant="outlined" sx={{ mr: 1 }}>
            DownloadFinal
          </Button>
          
        </DialogActions>

        {/* <audio id="audio" controls>
          Your browser does not support the audio element.
        </audio>  */}

        {generatedContent &&
          generatedContent.map((slide, contentIndex) => {

            return (
              <Box key={contentIndex}  sx={{ display: (fetching==false) ? "block": "none", padding:"15px"}}>
                <Box>
                  <TextField
                    sx={{
                      color: 'rgb(0, 122, 255)',
                      width: '50%',
                      'padding-bottom': '10px',
                      'padding-right': '20px',
                      mb: 2
                    }}
                    defaultValue={slide.text}
                    multiline
                    variant="filled"
                  />

                  <TextField
                    sx={{
                      color: 'rgb(0, 122, 255)',
                      width: '50%',
                      'padding-bottom': '10px',
                      'padding-right': '20px',
                      mb: 2
                    }}
                    defaultValue={slide.distillation}
                    onBlur={(e) => handleDistilationUpdate(e.target.value, contentIndex) }
                    multiline
                    variant="filled"
                  />

                </Box>

                <img style={{ width: '200px' }} width="200px" src={slide.image} />
                <Skeleton sx={{ display: (slide.image===null) ? "block": "none", padding:"15px"}} variant="rectangular" width="200px" height="200px"  />

                <IconButton onClick={() => handleRegenerateImage(contentIndex)} color="primary" aria-label="Regenerate Image" component="label">
                    <CachedRoundedIcon />
                  </IconButton>

                  {/* <IconButton onClick={() => playAudio(contentIndex)} color="primary" aria-label="Refine Image" component="label">
                    <VolumeUpRoundedIcon />
                  </IconButton> */}
              </Box>
            );
          })}

        <AnswerSkeleton numOfItems={5} renderBody={fetching} />
      </DialogContent>
    </>
  );

}

export default ConvertTextToVideoDialog;
