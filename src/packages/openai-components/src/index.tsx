import { PluginDescriptor } from '@craftercms/studio-ui';
import { GenerateContent } from './components/GenerateContent';
import GenerateContentDialog from './components/GenerateContentDialog';

const plugin: PluginDescriptor = {
  locales: undefined,
  scripts: undefined,
  stylesheets: undefined,
  id: 'org.rd.plugin.openai',
  widgets: {
    'org.rd.plugin.openai.GenerateContent': GenerateContent,
    'org.rd.plugin.openai.dialog': GenerateContentDialog
  }
};

export { GenerateContent, GenerateContentDialog };

export default plugin;
