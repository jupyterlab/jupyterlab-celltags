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

import {
  Cell
} from '@jupyterlab/cells'

import {
  Message
} from '@phosphor/messaging'

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
    tabsBarTitle.innerHTML = 'Tags';
    let addButton = document.createElement('button');
    addButton.innerHTML = 'New Tag';
    let _self = this;
    addButton.onclick = function() {
      console.log(_self.activeCell.model.metadata.get("tags"));
    };
    widget.node.appendChild(tabsBarTitle);
    widget.node.appendChild(addButton);
    layout.addWidget(widget);
  }

  /**
   * Handle a change to the active cell.
   */
  protected onActiveCellChanged(msg: Message): void {
    this.activeCell = this.parent.activeCell;
  }

  private activeCell: Cell = null;

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
    activeCell: Cell
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
    let cell = cellTools.activeCell;
    let tagsTool = new TagsTool({ activeCell: cell });
    cellTools.addItem({tool: tagsTool})    
  }
};

export default extension;
