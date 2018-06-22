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
  INotebookTracker
} from '@jupyterlab/notebook';

import '../style/index.css';

import runCell from '@jupyterlab/notebook';

import {
  write_tag
} from './celltags';

import '../style/index.css';

const TAG_TOOL_CLASS = 'jp-cellTags-Tools';
const TAGS_COLLECTION_CLASS = 'jp-cellTags-all-tags-div';
const TAG_LABEL_DIV_CLASS = 'jp-cellTags-tag-label-div';
const TAG_ADD_TAG_BUTTON_CLASS = 'jp-cellTags-add-tag-button';
const TAG_DONE_BUTTON_CLASS = 'jp-cellTags-done-button';
const TAG_NEW_TAG_INPUT = 'jp-cellTags-new-tag-input';

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

  runAll(tracker: INotebookTracker, selectedTag: string) {
    let session = tracker.currentWidget.session;
    let notebook = tracker.currentWidget;
    let cell:any;
    for (cell in notebook.model.cells) {
      if (selectedTag in cell.model.metadata.get("cells")) {
        runCell(notebook, cell, session );
      }
    }
  }

  replaceName(tracker: INotebookTracker, newTag: string, oldTag: string) {
    let notebook = tracker.currentWidget;
    let cell:any;
    for (cell in notebook.model.cells) {
      if (oldTag in cell.model.metadata.get("cells")) {
        let tagList = cell.model.metadata.get("cells");
        let index = tagList.indexOf(oldTag);
        tagList = tagList.splice(index, 1);
        tagList = tagList.put(newTag);
        cell.model.metadata.set(tagList);
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
    let tagNames: string[] = [];
    for (var i=0; i<newTagInputs.length; i++) {
      let tagName: string = (newTagInputs[i] as HTMLInputElement).value;
      tagNames.push(tagName);
    }
    for (var i=0; i<tagNames.length; i++) {
      write_tag(_self.currentActiveCell, tagNames[i], true);
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
          node.addEventListener('click', function() {
            _self.tagClicked(_self, this);
          })
          _self.allTagsNode.appendChild(node);
        });
      }
    }
  }

  tagClicked(_self: TagsWidget, tag: HTMLElement) {
    /* The commented out code below supports selecting multiple cells */
    /*
    let tagName = tag.getElementsByTagName('label')[0].innerHTML;
    if (_self.selectedTags.indexOf(tagName) == -1) {
      tag.style.backgroundColor = 'red';
      _self.selectedTags.push(tagName);
    } else {
      tag.style.backgroundColor = 'white';
      let index = _self.selectedTags.indexOf(tagName, 0);
      _self.selectedTags.splice(index, 1);
    } */
    if (_self.selectedTag == null) {
      _self.selectedTag = tag;
      _self.selectedTag.style.backgroundColor = 'red';
    } else if (_self.selectedTag == tag) {
      _self.selectedTag.style.backgroundColor = 'white';
      _self.selectedTag = null;
    } else {
      _self.selectedTag.style.backgroundColor = 'white';
      _self.selectedTag = tag;
      _self.selectedTag.style.backgroundColor = 'red';
    }
    console.log(_self.selectedTagName)
  }

  get allTagsNode() {
    return this.node.getElementsByClassName(TAGS_COLLECTION_CLASS)[0];
  }

  get selectedTagName() {
    if (this.selectedTag == null) {
      return null;
    }
    return this.selectedTag.getElementsByTagName('label')[0].innerHTML;
  }

  currentActiveCell: Cell = null;
  // selectedTags: string[] = [];
  private selectedTag: HTMLElement = null;

}

class TagsTool extends CellTools.Tool {

  constructor() {
    super();
    let layout = this.layout = new PanelLayout();
    this.addClass(TAG_TOOL_CLASS);
    this.widget = new TagsWidget();
    layout.addWidget(this.widget);
  }

  get selectedTag() {
    return this.widget.selectedTagName;
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
