import { JupyterLab, JupyterFrontEndPlugin } from '@jupyterlab/application';

import { INotebookTools, INotebookTracker } from '@jupyterlab/notebook';

import { TagsTool } from './components';

import '../style/index.css';

/**
 * Initialization data for the jupyterlab-celltags extension.
 */
function activate(
  app: JupyterLab,
  cellTools: INotebookTools,
  notebook_Tracker: INotebookTracker
) {
  const tagsTool = new TagsTool(notebook_Tracker, app);
  cellTools.addItem({ tool: tagsTool, rank: 1.7 });
}

const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-celltags',
  autoStart: true,
  requires: [INotebookTools, INotebookTracker],
  activate: activate
};

export default extension;
