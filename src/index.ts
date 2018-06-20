import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  ICellTools
} from '@jupyterlab/notebook';

import {
  CellTools
} from '@jupyterlab/notebook';

import {
  Widget, PanelLayout
} from '@phosphor/widgets'

import '../style/index.css';

const TAG_TOOL_CLASS = 'jp-cellTags-Tools';

class TagsTool extends CellTools.Tool {

  constructor(options: TagsTool.IOptions) {
    super();
    this.addClass(TAG_TOOL_CLASS);
    let layout = this.layout = new PanelLayout();
    let widget = new Widget();
    widget.id = 'cellsTags-tool';
    widget.title.label = 'Tags';
    widget.title.closable = true;
    let tabsBarTitle = document.createElement('div');
    tabsBarTitle.innerHTML = "hello";
    widget.node.appendChild(tabsBarTitle);
    layout.addWidget(widget);
  }

} 

namespace TagsTool {
  /**
   * The options used to initialize a metadata editor tool.
   */
  export
  interface IOptions {
    /**
     * The editor factory used by the tool.
     */
  }
}

/**
 * Initialization data for the jupyterlab-celltags extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab-celltags',
  autoStart: true,
  requires: [ICellTools], 
  activate: (app: JupyterLab, cellTools: ICellTools) => {
    let tagsTool = new TagsTool({ });
    cellTools.addItem({tool: tagsTool})    
  }
};

export default extension;
