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

import {
  ObservableJSON
} from '@jupyterlab/observables'

import '../style/index.css';

const TAG_TOOL_CLASS = 'jp-cellTags-Tools';

class TagsTool extends CellTools.Tool {

  constructor(options: TagsTool.IOptions) {
    super();
    this.addClass(TAG_TOOL_CLASS);
    let layout = this.layout = new PanelLayout();
    this.widget = new Widget();
    this.widget.id = 'cellsTags-tool';
    this.widget.title.label = 'Tags';
    this.widget.title.closable = true;
    let tabsBarTitle = document.createElement('div');
    tabsBarTitle.innerHTML = 'Tags';
    tabsBarTitle.id = 'allTags';
    let addButton = document.createElement('button');
    addButton.innerHTML = 'New Tag';
    let _self = this;
    addButton.onclick = function() {
      console.log(_self.activeCell.model.metadata.get("tags"));
    };
    this.widget.node.appendChild(tabsBarTitle);
    this.widget.node.appendChild(addButton);
    layout.addWidget(this.widget);
  }

  private loadLabels() {
    let tagsDiv = document.getElementById('allTags');
    tagsDiv.innerHTML = 'Tags';
    let cell = this.activeCell
    if (cell != null) {
      let tags = cell.model.metadata.get("tags")
      if (tags != null) {
        tags.toString().split(',').forEach(function(tag: string) {
          let labelBox = document.createElement('div');
          labelBox.innerHTML = tag;
          tagsDiv.appendChild(labelBox);
        });
      }
    }
  }

  /**
   * Handle a change to the active cell.
   */
  protected onActiveCellChanged(msg: Message): void {
    this.activeCell = this.parent.activeCell;
    this.loadLabels();
  }

  protected onMetadataChanged(msg: ObservableJSON.ChangeMessage): void {
    this.loadLabels();
  }

  private activeCell: Cell = null;
  private widget: Widget = null;

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
