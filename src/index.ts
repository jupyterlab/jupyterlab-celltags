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

import '../style/index.css';

const TAG_TOOL_CLASS = 'jp-cellTags-Tools';
const TAGS_COLLECTION_CLASS = 'jp-cellTags-all-tags-div';
const TAG_LABEL_DIV_CLASS = 'jp-cellTags-tag-label-div';
const TAG_ADD_TAG_BUTTON_CLASS = 'jp-cellTags-add-tag-button';
const TAG_DONE_BUTTON_CLASS = 'jp-cellTags-done-button';
const TAG_NEW_TAG_INPUT = 'jp-cellTags-new-tag-input';

import {
  NotebookActions
} from '@jupyterlab/notebook';

import {
  INotebookTracker
} from '@jupyterlab/notebook';

import '../style/index.css';


const TAG_TOOL_CLASS = 'jp-cellTags-Tools';
const TAGS_COLLECTION_CLASS = 'jp-cellTags-all-tags-div';
const TAG_LABEL_DIV_CLASS = 'jp-cellTags-tag-label-div';

function createAllTagsNode() {
  let node = VirtualDOM.realize(
    h.div({ },
      h.label('Tags'),
      h.button({ className: TAG_ADD_TAG_BUTTON_CLASS }, 'New Tag'),
      h.button({ className: TAG_DONE_BUTTON_CLASS }, 'Done'),
      h.div({ className: TAGS_COLLECTION_CLASS }))
  );
  Styling.styleNode(node);
  return node;
}

class TagsWidget extends Widget {

  constructor() {
    super({ node: createAllTagsNode() });
    let _self = this;

    let addTagButton = this.node.getElementsByClassName(TAG_ADD_TAG_BUTTON_CLASS)[0];
    addTagButton.addEventListener('click', function() {
      _self.showNewTagInputBox(_self);
    }, false);

    let doneButton = this.node.getElementsByClassName(TAG_DONE_BUTTON_CLASS)[0];
    doneButton.addEventListener('click', function() {
      _self.finishAddingNewTags(_self);
    }, false);
  }

  showNewTagInputBox(_self: TagsWidget) {
    let node = VirtualDOM.realize(
      h.div({ className: TAG_LABEL_DIV_CLASS },
        h.input({ className: TAG_NEW_TAG_INPUT }))
    )
    _self.allTagsNode.appendChild(node);
  }

  finishAddingNewTags(_self: TagsWidget) {
    let newTagInputs = _self.node.getElementsByClassName(TAG_NEW_TAG_INPUT);
    for (let i=0; i<newTagInputs.length; i++) {
      alert((newTagInputs[i] as HTMLInputElement).value);
  }

  runAll() {
    let SESSION = INotebookTracker.currentWidget.session;
    let NOTEBOOK = INotebookTracker.currentWidget;
    let nbWidget = docManager.open(NOTEBOOK) as NotebookPanel;
    //let currentTag = retrieve selectedTag
    for (Cell cell : Jupyter.notebook.cells) {
      if (currentTag in cell's tags) {
        NotebookActions.runCell()
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
  requires: [ICellTools], 
  activate: (app: JupyterLab, cellTools: ICellTools) => {
    let tagsTool = new TagsTool();
    cellTools.addItem({tool: tagsTool})    
  }
};

export default extension;
