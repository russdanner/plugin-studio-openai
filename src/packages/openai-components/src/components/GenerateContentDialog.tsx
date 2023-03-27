import * as React from 'react';
import { useDispatch } from 'react-redux';

import { ChangeEvent, useState } from 'react';
import Skeleton from '@mui/material/Skeleton';
import {
  Box,
  Button,
  Card,
  CardHeader,
  CardMedia,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { get } from '@craftercms/studio-ui/utils/ajax';

import useActiveSiteId from '@craftercms/studio-ui/hooks/useActiveSiteId';
import { ApiResponse } from '@craftercms/studio-ui';
import { copyToClipboard } from '@craftercms/studio-ui/utils/system';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import { showSystemNotification } from '@craftercms/studio-ui/state/actions/system';

import FormControl from '@mui/material/FormControl';

export function MediaSkeletonCard() {
  const classes = useCardStyles();
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

export function GenerateContentDialog(props) {
  const dispatch = useDispatch();
  const siteId = useActiveSiteId();
  const [error, setError] = useState();
  const [fetching, setFetching] = useState(false);

  const [generatedContent, setGeneratedContent] = useState([]);
  const [ask, setAsk] = React.useState('Write a story');
  const [mode, setMode] = React.useState('complete');

  const PLUGIN_SERVICE_BASE = '/studio/api/2/plugin/script/plugins/org/rd/plugin/openai/openai';

  const handleAskChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAsk(event.target.value as string);
  };

  const handleCopyResult = (index) => {
    copyToClipboard(generatedContent[index]);

    dispatch(
      showSystemNotification({
        message: 'Copied',
        options: { variant: 'success', autoHideDuration: 1500 }
      })
    );
  };

  const handleGenerate = () => {
    let serviceUrl = `${PLUGIN_SERVICE_BASE}/gentext.json?siteId=${siteId}&ask=${ask}&mode=${mode}`;

    setFetching(true);

    get(serviceUrl).subscribe({
      next: (response) => {
        console.log(response);

        setFetching(false);
        setGeneratedContent([...response.response.result]);
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

  function handleModeChange(event: ChangeEvent<HTMLInputElement>, value: string): void {
    setMode(value);
    setGeneratedContent([]);
  }

  return (
    <>
      <DialogContent>
        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Generate</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            value={mode}
            onChange={handleModeChange}
          >
            <FormControlLabel value="complete" control={<Radio />} label="Text" />
            <FormControlLabel value="image" control={<Radio />} label="Image" />
          </RadioGroup>
        </FormControl>

        <FormControl margin="normal" fullWidth>
          <TextField
            defaultValue=""
            id="outlined-basic"
            label="How can I help?"
            variant="outlined"
            onChange={handleAskChange}
          />
        </FormControl>
        <DialogActions>
          <Button onClick={handleGenerate} variant="outlined" sx={{ mr: 1 }}>
            Generate
          </Button>
        </DialogActions>

        {mode === 'image' ? (
          <Box display="flex">
            <section>
              <div>
                {fetching === false ? (
                  generatedContent.map((item) => [
                    <Card>
                      <CardHeader></CardHeader>
                      <CardMedia
                        image={item}
                        sx={{ width: '500px', height: '500px', margin: '30px', m: '15px', border: '1px solid' }}
                      />

                      <a
                        download={item}
                        href={item}
                        target="_blank"
                        style={{ paddingBottom: '10px', paddingTop: '20px' }}
                      >
                        Download this image
                      </a>
                    </Card>
                  ])
                ) : (
                  <></>
                )}
              </div>
            </section>
          </Box>
        ) : (
          <DialogContentText>
            <ol>
              {generatedContent &&
                Object.values(generatedContent).map((content, contentIndex) => {
                  return (
                    <li>
                      <TextField
                        sx={{
                          color: 'rgb(0, 122, 255)',
                          width: '90%',
                          'padding-bottom': '10px',
                          'padding-right': '20px',
                          mb: 2
                        }}
                        value={content}
                        multiline
                      />

                      <IconButton onClick={() => handleCopyResult(contentIndex)} color="primary" aria-label="Copy to Clipboard" component="label">
                        <ContentCopyRoundedIcon />
                      </IconButton>
                    </li>
                  );
                })}
            </ol>
          </DialogContentText>
        )}
        <AnswerSkeleton numOfItems={5} renderBody={fetching} />
      </DialogContent>
    </>
  );
}

export default GenerateContentDialog;
function useCardStyles() {
  throw new Error('Function not implemented.');
}
