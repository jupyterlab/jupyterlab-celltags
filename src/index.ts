import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import '../style/index.css';


/**
 * Initialization data for the celltags extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'celltags',
  autoStart: true,
  activate: (app: JupyterLab) => {
    console.log('JupyterLab extension celltags is activated!');
  }
};

export default extension;
