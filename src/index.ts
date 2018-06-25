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

// import runCell from '@jupyterlab/notebook';

import {
  write_tag
} from './celltags';

import '../style/index.css';

const TAG_TOOL_CLASS = 'jp-cellTags-Tools';
const TAGS_COLLECTION_CLASS = 'jp-cellTags-all-tags-div';
const TAG_LABEL_DIV_CLASS = 'jp-cellTags-tag-label-div';
const TAG_ADD_TAG_BUTTON_CLASS = 'jp-cellTags-add-tag-button';
const TAG_DONE_BUTTON_CLASS = 'jp-cellTags-done-button';
const TAG_REMOVE_TAG_BUTTON_CLASS = 'jp-cellTags-remove-button';
const TAG_RENAME_TAG_BUTTON_CLASS = 'jp-cellTags-rename-button';
const TAG_NEW_TAG_INPUT = 'jp-cellTags-new-tag-input';
const TAG_RENAME_TAG_INPUT = 'jp-cellTags-rename-tag-input';

const TAG_EDIT_STATUS_NULL = 0;
const TAG_EDIT_STATUS_ADD = 1;
const TAG_EDIT_STATUS_RENAME = 2;

function createAllTagsNode() {
  let node = VirtualDOM.realize(
    h.div({ },
      h.label('Tags'),
      h.button({ className: TAG_ADD_TAG_BUTTON_CLASS }, 'New Tag'),
      h.button({ className: TAG_REMOVE_TAG_BUTTON_CLASS }, 'Remove Tag'),
      h.button({ className: TAG_RENAME_TAG_BUTTON_CLASS }, 'Rename'),
      h.button({ className: TAG_DONE_BUTTON_CLASS }, 'Done'),
      h.div({ className: TAGS_COLLECTION_CLASS }))
  );
  Styling.styleNode(node);
  return node;
}

class TagsWidget extends Widget {

  constructor(notebook_Tracker: INotebookTracker) {
    super({ node: createAllTagsNode() });
    let _self = this;
    this.notebookTracker = notebook_Tracker;

    let addTagButton = this.node.getElementsByClassName(TAG_ADD_TAG_BUTTON_CLASS)[0];
    addTagButton.addEventListener('click', function() {
      _self.showNewTagInputBox(_self);
    }, false);

    let doneButton = this.node.getElementsByClassName(TAG_DONE_BUTTON_CLASS)[0];
    doneButton.addEventListener('click', function() {
      _self.didFinishEditingTags(_self);
    }, false);

    let removeButton = this.node.getElementsByClassName(TAG_REMOVE_TAG_BUTTON_CLASS)[0];
    removeButton.addEventListener('click', function() {
      _self.removeSelectedTagForSelectedCell(_self);
    }, false);

    let renameButton = this.node.getElementsByClassName(TAG_RENAME_TAG_BUTTON_CLASS)[0];
    renameButton.addEventListener('click', function() {
      _self.renameSelectedTagForAllCells(_self);
    }, false);
  }

  runAll() {
    //let session = this.notebookTracker.currentWidget.session;
    let notebook = this.notebookTracker.currentWidget;
    let cell:any;
    for (cell in notebook.model.cells) {
      if (this.selectedTagName in cell.model.metadata.get("cells")) {
        //runCell(notebook, cell, session );
      }
    }
  }

  replaceName(newTag: string) {
    console.log("I'm doing something!");
    let oldTag = this.tagOldName;
    let notebook = this.notebookTracker.currentWidget;
    let cells = notebook.model.cells;
    for (var i=0; i<cells.length; i++) {
      let cellMetadata = cells.get(i).metadata;
      let cellTagsData = cellMetadata.get('tags') as string[];
      if (cellMetadata) {
        for (var j=0; j<cellTagsData.length; j++) {
          if (cellTagsData[j] == oldTag) {
            cellTagsData[j] = newTag;
          }
        }
        cellMetadata.set('tags', cellTagsData);
      }
      /* if (oldTag in cell.metadata.get("cells")) {
        let tagList = cell.metadata.get("cells");
        let index = tagList.indexOf(oldTag);
        tagList = tagList.splice(index, 1);
        tagList = tagList.put(newTag);
        cell.metadata.set(tagList);
      } */
    }
  }

  showNewTagInputBox(_self: TagsWidget) {
    if (_self.editingStatus == TAG_EDIT_STATUS_NULL) {
      _self.editingStatus = TAG_EDIT_STATUS_ADD;
      let node = VirtualDOM.realize(
        h.div({ className: TAG_LABEL_DIV_CLASS },
          h.input({ className: TAG_NEW_TAG_INPUT }))
      )
      node.getElementsByClassName(TAG_NEW_TAG_INPUT)[0].addEventListener('keydown', function(event) {
        switch ((event as KeyboardEvent).keyCode) {
        case 13:
          _self.didFinishEditingTags(_self);
          break;
        }
      })
      _self.allTagsNode.appendChild(node);
    }
  }

  didFinishEditingTags(_self: TagsWidget) {
    /* let newTagInputs = _self.node.getElementsByClassName(TAG_NEW_TAG_INPUT);
    let tagNames: string[] = [];
    for (var i=0; i<newTagInputs.length; i++) {
      let tagName: string = (newTagInputs[i] as HTMLInputElement).value;
      tagNames.push(tagName);
    }
    for (var i=0; i<tagNames.length; i++) {
      write_tag(_self.currentActiveCell, tagNames[i], true);
    } */
    if (_self.editingStatus != TAG_EDIT_STATUS_NULL) {
      if (_self.editingStatus == TAG_EDIT_STATUS_ADD) {
        let newTagInputs = _self.node.getElementsByClassName(TAG_NEW_TAG_INPUT)[0] as HTMLInputElement;
        write_tag(_self.currentActiveCell, newTagInputs.value, true);
      } else if (_self.editingStatus == TAG_EDIT_STATUS_RENAME) {
        let newTagInputs = _self.node.getElementsByClassName(TAG_RENAME_TAG_INPUT)[0] as HTMLInputElement;
        _self.replaceName(newTagInputs.value);
      }
      _self.editingStatus = TAG_EDIT_STATUS_NULL;
      _self.loadTagLabels();
    }
  }

  removeSelectedTagForSelectedCell(_self: TagsWidget) {
    write_tag(_self.currentActiveCell, _self.selectedTagName, false);
  }

  renameSelectedTagForAllCells(_self: TagsWidget) {
    if (_self.editingStatus == TAG_EDIT_STATUS_NULL) {
      _self.editingStatus = TAG_EDIT_STATUS_RENAME;
      _self.tagOldName = _self.selectedTagName;
      let node = VirtualDOM.realize(
        h.div({ className: TAG_LABEL_DIV_CLASS },
          h.input({ className: TAG_RENAME_TAG_INPUT, value: _self.tagOldName }))
      );
      node.getElementsByClassName(TAG_RENAME_TAG_INPUT)[0].addEventListener('keydown', function(event) {
        switch ((event as KeyboardEvent).keyCode) {
        case 13:
          _self.didFinishEditingTags(_self);
          break;
        }
      })
      _self.selectedTag.innerHTML = '';
      _self.selectedTag.appendChild(node);
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
    if (_self.editingStatus != TAG_EDIT_STATUS_NULL) {
      if (tag == _self.selectedTag) {
        return;
      }
      _self.editingStatus = TAG_EDIT_STATUS_NULL;
      _self.tagOldName = null;
      _self.loadTagLabels();
    }
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
  private editingStatus = TAG_EDIT_STATUS_NULL;
  private tagOldName: string = null;
  public notebookTracker: INotebookTracker = null;
}

class TagsTool extends CellTools.Tool {

  constructor(notebook_Tracker: INotebookTracker) {
    super();
    let layout = this.layout = new PanelLayout();
    this.addClass(TAG_TOOL_CLASS);
    this.widget = new TagsWidget(notebook_Tracker);
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
  public notebookTracker: INotebookTracker = null;
} 

namespace TagsTool {
  /**
   * The options used to initialize a metadata editor tool.
   */

}

/**
 * Initialization data for the jupyterlab-celltags extension.
 */
function activate(app: JupyterLab, cellTools: ICellTools, notebook_Tracker: INotebookTracker) {
  let tagsTool = new TagsTool(notebook_Tracker);
  app.commands.execute('notebook:run-cell', {a: 'hello'});
  cellTools.addItem({tool: tagsTool}) 
}

const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab-celltags',
  autoStart: true,
  requires: [ICellTools, INotebookTracker],
  activate: activate
};

export default extension;
