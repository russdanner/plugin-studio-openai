import * as React from 'react';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import {
  Box,
  Card,
  CardHeader,
  CardActions,
  CardContent,
  Collapse,
  Paper,
  Typography,
  cardClasses,
  Fab,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from '@mui/material';

import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import { createCustomDocumentEventListener } from '@craftercms/studio-ui/utils/dom';
import useActiveSiteId from '@craftercms/studio-ui/hooks/useActiveSiteId';
import { get } from '@craftercms/studio-ui/utils/ajax';
import { ApiResponse, ApiResponseErrorState } from '@craftercms/studio-ui';
import { copyToClipboard } from '@craftercms/studio-ui/utils/system';


import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';


export function GenerateContentDialog(props) {

  const siteId = useActiveSiteId();
  const [error, setError] = useState();
  const [generatedContent, setGeneratedContent] = useState([]);
  const [ask, setAsk] = React.useState('Write a story');


  const PLUGIN_SERVICE_BASE = '/studio/api/2/plugin/script/plugins/org/rd/plugin/openai/openai';

  const handleAskChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAsk(event.target.value as string);
  };

  const copyResult = () => {
    alert("copy")
  };

  const handleGenerate = () => {
    let serviceUrl = `${PLUGIN_SERVICE_BASE}/gentext.json?siteId=${siteId}&ask=${ask}`;

    get(serviceUrl).subscribe({
      next: (response) => {
        console.log(response.response.result)
        setGeneratedContent([...response.response.result]);
      },
      error(e) {
        console.error(e);
        setError(
          e.response?.response ?? ({ code: '?', message: 'Unknown Error. Check browser console.' } as ApiResponse)
        );
      }
  });
  }

  return (
    <>
<DialogContent>
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

        <DialogContentText>
          <ol>
          { generatedContent && 
            Object.values(generatedContent).map((content, contentIndex) => {
              return (
              
                <li>
                  <TextField
                    sx={{ "background-color":"#F8F8F8", "color":"rgb(0, 122, 255)", "width": "90%", "padding-bottom": "10px", "padding-right":"20px",  mb: 2 }}
                    value={content}
                    multiline/>

                  <Button type="button" onClick={copyResult} variant="outlined" sx={{ mr: 1 }}>
                    Copy
                  </Button>
                </li>   
            )})
          }
          </ol>
        </DialogContentText>
      </DialogContent>
    </>
  );
};

export default GenerateContentDialog;