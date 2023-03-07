import * as React from 'react';
//import { makeStyles } from 'tss-react/mui';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { green, red } from '@mui/material/colors';
import { Theme } from '@mui/material/styles';

import { Button, DialogActions, DialogContent, DialogContentText, TextField } from '@mui/material';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/HighlightOffRounded';

import useActiveSiteId from '@craftercms/studio-ui/hooks/useActiveSiteId';
import { get } from '@craftercms/studio-ui/utils/ajax';
import { ApiResponse, ApiResponseErrorState } from '@craftercms/studio-ui';
import { copyToClipboard } from '@craftercms/studio-ui/utils/system';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import { useSpreadState } from '@craftercms/studio-ui/hooks/useSpreadState';

import FormControl from '@mui/material/FormControl';

export function GenerateContentDialog(props) {
  const notificationInitialState = {
    open: false,
    variant: 'success'
  };

  // const useStyles = makeStyles()((theme: Theme) => ({
  //   form: {
  //     padding: '20px'
  //   },
  //   title: {
  //     color: '#555555'
  //   },
  //   success: {
  //     backgroundColor: green[600]
  //   },
  //   error: {
  //     backgroundColor: red[600]
  //   },
  //   icon: {
  //     fontSize: 20
  //   },
  //   iconVariant: {
  //     opacity: 0.9,
  //     marginRight: theme.spacing(1)
  //   },
  //   message: {
  //     display: 'flex',
  //     alignItems: 'center'
  //   }
  // }));

  //const { classes } = useStyles();
  const siteId = useActiveSiteId();
  const [error, setError] = useState();
  const [notificationSettings, setNotificationSettings] = useSpreadState(notificationInitialState);
  const [generatedContent, setGeneratedContent] = useState([]);
  const [ask, setAsk] = React.useState('Write a story');

  const PLUGIN_SERVICE_BASE = '/studio/api/2/plugin/script/plugins/org/rd/plugin/openai/openai';

  const handleAskChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAsk(event.target.value as string);
  };

  const copyResult = () => {
    copyToClipboard(generatedContent[0]);
    setNotificationSettings({ open: true, variant: 'success' });
  };

  const handleGenerate = () => {
    let serviceUrl = `${PLUGIN_SERVICE_BASE}/gentext.json?siteId=${siteId}&ask=${ask}`;

    get(serviceUrl).subscribe({
      next: (response) => {
        console.log(response.response.result);
        setGeneratedContent([...response.response.result]);
      },
      error(e) {
        console.error(e);
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

                    <Button type="button" onClick={copyResult} variant="outlined" sx={{ mr: 1 }}>
                      Copy
                    </Button>
                  </li>
                );
              })}
          </ol>
        </DialogContentText>
      </DialogContent>
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        open={notificationSettings.open}
        autoHideDuration={2000}
      >
        {/*className={`${notificationSettings.variant === 'success' ? classes.success : classes.error} ${
            classes.iconVariant
          }`}

className={classes.icon}
*/}

        <SnackbarContent
          message={'Copied'}
          action={[
            <IconButton
              key="close"
              aria-label="close"
              color="inherit"
              onClick={() => setNotificationSettings({ open: false })}
              size="large"
            >
              <CloseIcon />
            </IconButton>
          ]}
        />
      </Snackbar>
    </>
  );
}

export default GenerateContentDialog;
