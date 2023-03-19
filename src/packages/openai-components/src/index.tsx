import { PluginDescriptor } from '@craftercms/studio-ui';
import ConvertTextToVideoDialog from './components/ConvertTextToVideoDialog';

import { GenerateContent } from './components/GenerateContent';
import GenerateContentDialog from './components/GenerateContentDialog';
import TextToVideo from './components/TextToVideo';

const plugin: PluginDescriptor = {
  locales: undefined,
  scripts: undefined,
  stylesheets: undefined,
  id: 'org.rd.plugin.openai',
  widgets: {
    'org.rd.plugin.openai.GenerateContent': GenerateContent,
    'org.rd.plugin.openai.dialog': GenerateContentDialog,
    'org.rd.plugin.openai.TextToVideo': TextToVideo,
    'org.rd.plugin.openai.ConvertTextToVideoDialog': ConvertTextToVideoDialog
  }
};

export { GenerateContent, GenerateContentDialog, TextToVideo, ConvertTextToVideoDialog };

export default plugin;
