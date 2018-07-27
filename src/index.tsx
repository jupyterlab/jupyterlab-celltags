import { JupyterLab, JupyterLabPlugin } from "@jupyterlab/application";

import { ICellTools, INotebookTracker } from "@jupyterlab/notebook";

import { TagsTool } from "./components";

import "../style/index.css";

/**
 * Initialization data for the jupyterlab-celltags extension.
 */
function activate(
  app: JupyterLab,
  cellTools: ICellTools,
  notebook_Tracker: INotebookTracker
) {
  const tagsTool = new TagsTool(notebook_Tracker, app);
  cellTools.addItem({ tool: tagsTool, rank: 1.7 });
}

const extension: JupyterLabPlugin<void> = {
  id: "jupyterlab-celltags",
  autoStart: true,
  requires: [ICellTools, INotebookTracker],
  activate: activate
};

export default extension;
