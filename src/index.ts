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
} from '@phosphor/widgets';

import {
  Cell
} from '@jupyterlab/cells';

import {
  Message
} from '@phosphor/messaging';

import {
  ObservableJSON
} from '@jupyterlab/observables';

import {
  h, VirtualDOM
} from '@phosphor/virtualdom';

import {
  Styling
} from '@jupyterlab/apputils';

import {
  NotebookActions
} from '@jupyterlab/notebook';

import {
  INotebookTracker
} from '@jupyterlab/notebook';

import '../style/index.css';

import runCell from '@jupyterlab/notebook';

const TAG_TOOL_CLASS = 'jp-cellTags-Tools';
const TAGS_COLLECTION_CLASS = 'jp-cellTags-all-tags-div';
const TAG_LABEL_DIV_CLASS = 'jp-cellTags-tag-label-div';

function createAllTagsNode() {
  let node = VirtualDOM.realize(
    h.div({ },
      h.label("Tags"),
      h.div({ className: TAGS_COLLECTION_CLASS }))
  );
  Styling.styleNode(node);
  return node;
}

class TagsWidget extends Widget {

  constructor() {
    super({ node: createAllTagsNode() });
  }

  runAll(tracker: INotebookTracker) {
    let session = tracker.currentWidget.session;
    let notebook = tracker.currentWidget;
    let currentTag = retrieveSelected()
    let cell:any;
    for (cell in notebook.model.cells) {
      if (currentTag in cell.model.metadata.get("cells")) {
        runCell(notebook, cell, session );
      }
    }
  }

  loadTagLabels() {
    this.allTagsNode.innerHTML = '';
    if (this.currentActiveCell != null) {
      let tags = this.currentActiveCell.model.metadata.get("tags")
      if (tags != null) {
        let _self = this;
        tags.toString().split(',').forEach(function(tag: string) {
          let node = VirtualDOM.realize(
            h.div({ className: TAG_LABEL_DIV_CLASS },
              h.label(tag))
          )
          _self.allTagsNode.appendChild(node);
        });
      }
    }
  }

  get allTagsNode() {
    return this.node.getElementsByClassName(TAGS_COLLECTION_CLASS)[0];
  }

  currentActiveCell: Cell = null;

}

class TagsTool extends CellTools.Tool {

  constructor() {
    super();
    let layout = this.layout = new PanelLayout();
    this.addClass(TAG_TOOL_CLASS);
    this.widget = new TagsWidget();
    let tabsBarTitle = document.createElement('div');
    tabsBarTitle.innerHTML = 'Tags';
    let addButton = document.createElement('button');
    addButton.innerHTML = 'Run all';
    addButton.onclick = function() {
      console.log("markelle did something!");
    };
    this.widget.node.appendChild(tabsBarTitle);
    this.widget.node.appendChild(addButton);
    layout.addWidget(this.widget);
  }

  /**
   * Handle a change to the active cell.
   */
  protected onActiveCellChanged(msg: Message): void {
    this.widget.currentActiveCell = this.parent.activeCell;
    this.widget.loadTagLabels();
  }

  protected onMetadataChanged(msg: ObservableJSON.ChangeMessage): void {
    this.widget.loadTagLabels();
  }

  private widget: TagsWidget = null;
} 

namespace TagsTool {
  /**
   * The options used to initialize a metadata editor tool.
   */

}

/**
 * Initialization data for the jupyterlab-celltags extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab-celltags',
  autoStart: true,
  requires: [ICellTools, INotebookTracker],
  activate: (app: JupyterLab, cellTools: ICellTools) => {
    let tagsTool = new TagsTool();
    cellTools.addItem({tool: tagsTool})    
  }
};

export default extension;