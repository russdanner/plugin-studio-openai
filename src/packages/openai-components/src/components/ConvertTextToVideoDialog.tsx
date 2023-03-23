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
  IconButton,
  TextField,
} from '@mui/material';


import useActiveSiteId from '@craftercms/studio-ui/hooks/useActiveSiteId';
import { ApiResponse, EmptyState, FolderBrowserTreeView, SearchBar, SearchItem } from '@craftercms/studio-ui';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import FormControl from '@mui/material/FormControl';
import CachedRoundedIcon from '@mui/icons-material/CachedRounded';

export function MediaSkeletonCard() {
  return (
    <Card>
      <CardHeader
        avatar={<Skeleton variant="circular" width={24} height={24} />}
        title={<Skeleton animation="wave" height={20} width="100%" />}
      />
      <Skeleton animation="wave" variant="rectangular" />
    </Card>
  );
}

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
  const [sourceUrl, setSourceUrl] = React.useState('');
  const [mode, setMode] = React.useState('complete');

  const PLUGIN_SERVICE_BASE = '/studio/api/2/plugin/script/plugins/org/rd/plugin/openai/openai';

  const handleSourceUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSourceUrl(event.target.value as string);
  };

  const handleConstructVideo = () => {
    let serviceUrl = `${PLUGIN_SERVICE_BASE}/construct-video.json?siteId=${siteId}`;

    setFetching(true);

    console.log('post: ' + serviceUrl);
    console.log(generatedContent);

    postJSON(serviceUrl, generatedContent)
      .pipe(map(() => true))
      .subscribe({
        next() {},
        error({ response }) {}
      });

    console.log('posted');
  };

  
  const handleDistilationUpdate = (value, index) => {
    let slide = generatedContent[index]
    slide.distillation = value
    createImage(index)
  };

  const queueImage = (index) => {
    createImage(index)
  };


  const handleRegenerateImage = (index) => {
    createImage(index)
  };

  const createImage = (index) => {

    let slide = generatedContent[index]
    let distilation = slide.distillation
    
    let serviceUrl = `${PLUGIN_SERVICE_BASE}/gentext.json?siteId=${siteId}&ask=${distilation}&mode=image`;
    get(serviceUrl).subscribe({
      next: (response) => {
        let resultImage = [...response.response.result][0]

        if(resultImage) {
          slide.image = resultImage
        }
        else {
          slide.image = "/failed"
        }
        
      },
      error(e) {
        console.log("Issue generating image for prompt "+distilation, e)
        slide.image = "/failed"
      }
    });
  }

  const handleGenerate = () => {
    let serviceUrl = `${PLUGIN_SERVICE_BASE}/page-to-video.json?siteId=${siteId}&url=${sourceUrl}`;

    setFetching(true);

    get(serviceUrl).subscribe({
      next: (response) => {
        console.log(response.response.result);

        setFetching(false);

        setGeneratedContent([...response.response.result.slides]);
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

  return (
    <>
      <DialogContent>
        <FormControl margin="normal" fullWidth>
          <TextField defaultValue="" id="outlined-basic" label="URL to Convert" variant="outlined" />
        </FormControl>
        <DialogActions>
          <Button onClick={handleGenerate} variant="outlined" sx={{ mr: 1 }}>
            Generate
          </Button>

          <Button onClick={handleConstructVideo} variant="outlined" sx={{ mr: 1 }}>
            Construct Video
          </Button>
        </DialogActions>

        {generatedContent &&
          Object.values(generatedContent).map((slide, contentIndex) => {

            return (
              <Box key={contentIndex}>
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

                  <IconButton onClick={() => handleRegenerateImage(contentIndex)} color="primary" aria-label="Regenerate Image" component="label">
                    <CachedRoundedIcon />
                  </IconButton>

                  
                  {/* <audio controls>
                    <source
                      src={
                        '/studio/api/2/plugin/script/plugins/org/rd/plugin/openai/openai/download-audio.json?siteId=' +
                        siteId +
                        '&text=' +
                        slide.text
                      }
                      type="audio/mpeg"
                    />
                    Your browser does not support the audio element.
                  </audio> */}
                </Box>

                <img style={{ width: '200px' }} width="200px" src={slide.image!=null ? slide.image : queueImage(contentIndex)} />
              </Box>
            );
          })}

        <AnswerSkeleton numOfItems={5} renderBody={fetching} />
      </DialogContent>
    </>
  );
}

export default ConvertTextToVideoDialog;
