import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  ICellTools, CellTools, INotebookTracker
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

import '../style/index.css';

import {
  write_tag
} from './celltags';

import * as React from 'react';

import * as ReactDOM from 'react-dom';

import '../style/index.css';

const TAG_TOOL_CLASS = 'jp-cellTags-Tools';
const HEADER_CLASS = 'jp-cellTags-header';
const ALL_TAGS_HOST_CLASS = 'jp-cellTags-all-tags-host';
const TAGS_FOR_CELL_HOST_CLASS = 'jp-cellTags-tags-for-cell-host';
const TAGS_COLLECTION_CLASS = 'jp-cellTags-all-tags-div';
const TAG_LABEL_DIV_CLASS = 'jp-cellTags-tag-label-div';
const TAG_ADD_TAG_BUTTON_CLASS = 'jp-cellTags-add-tag-button';
const TAG_DONE_BUTTON_CLASS = 'jp-cellTags-done-button';
const TAG_REMOVE_TAG_BUTTON_CLASS = 'jp-cellTags-remove-button';
const TAG_RENAME_TAG_BUTTON_CLASS = 'jp-cellTags-rename-button';
const TAG_NEW_TAG_INPUT = 'jp-cellTags-new-tag-input';
const TAG_RENAME_TAG_INPUT = 'jp-cellTags-rename-tag-input';
const TAG_SELECT_ALL_BUTTON_CLASS = 'jp-cellTags-select-all-button';
const TAGS_ALL_TAGS_IN_NOTEBOOK_CLASS = 'jp-cellTags-all-tags-in-notebook-div';
const TAG_SEARCH_INPUT_CLASS = 'jp-cellTags-search-input'
const TAG_EDIT_STATUS_NULL = 0;
const TAG_EDIT_STATUS_ADD = 1;
const TAG_EDIT_STATUS_RENAME = 2;

namespace Private {

  export
  function createAllTagsNode() {
    const title = 'Tags';
    return (
      <React.Fragment>
        <div className={ HEADER_CLASS }>
          <span className={ HEADER_CLASS }>{ title }</span>
        </div>
        <span>All Tags In Notebook: </span>
        <div className={ ALL_TAGS_HOST_CLASS }></div>
        <span>Tags for Selected Cell: </span>
        <div className={ TAGS_FOR_CELL_HOST_CLASS }></div>
      </React.Fragment>
    );
  }

}
  
class AllTagsInNotebookComponent extends React.Component<any, Object> {

  render() {
    let tags = this.props.tags as string[];
    var renderedTags = null;
    if (tags != null) {
      renderedTags = tags.map((tag, index) => {
        return (
          <div
            className={ TAG_LABEL_DIV_CLASS }
            onClick={ () => console.log('clicked') }
          >
            {tag}
          </div>
        );
      });
    }
    return renderedTags;
  }

}

class TagsForSelectedCellComponent extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
    this.state = { selectedTab: null, pendingInput: false };
  }

  didSelectTagWithName(name: string) {
    this.setState({ selectedTab: name });
  }

  didFinishAddingTagWithName(name: string) {
    this.setState({ pendingInput: false });
    (this.props.widget as TagsWidget).didFinishAddingTags(name);
  }

  didPressedKeyIn(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.keyCode == 13) {
      let value = (event.target as HTMLInputElement).value;
      (event.target as HTMLInputElement).value = '';
      this.didFinishAddingTagWithName(value);
    }
  }

  render() {
    let tags = (this.props.tags as string).toString().split(',');
    var renderedTags = null;

    const { selectedTab } = this.state;
    if (tags != null) {
      renderedTags = tags.map((tag, index) => {
        const style = (selectedTab === tag)
                       ? { backgroundColor: "red" }
                       : { backgroundColor: "white" };
        return (
          <div
            className={ TAG_LABEL_DIV_CLASS }
            style={style}
            onClick={ (event) =>
              this.didSelectTagWithName(tag)
            }
          >
            {tag}
          </div>
        );
      });
    }
    return (
      <div>
        <button 
          className={ TAG_ADD_TAG_BUTTON_CLASS }
          onClick={ () => this.setState( { pendingInput: true } ) }
        >
          Add
        </button>
        { renderedTags }
        <input hidden={ !this.state.pendingInput } onKeyDown={ (event) => this.didPressedKeyIn(event) } />
      </div>
    );
  }

}

class TagsWidget extends Widget {

  constructor(notebook_Tracker: INotebookTracker) {
    super();
    let _self = this;
    this.notebookTracker = notebook_Tracker;

    ReactDOM.render(Private.createAllTagsNode(), this.node);

    /* let searchInput = this.node.getElementsByClassName(TAG_SEARCH_INPUT_CLASS)[0];
    searchInput.addEventListener('input', function() {
      _self.searchBoxValueDidChange(this.value);
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

    let selectAllButton = this.node.getElementsByClassName(TAG_SELECT_ALL_BUTTON_CLASS)[0];
    selectAllButton.addEventListener('click', function() {
      _self.selectAll(_self);
    }, false); */

  }

  containsTag(tag:string, cell: Cell) {
    let tagList = cell.model.metadata.get("tags") as string[];
    if (tagList) {
      console.log(tagList);
      for (let i=0; i< tagList.length; i++){
        if (tagList[i] === tag) {
          return true;
        }
      }
      return false;
    }
  }

  selectAll(_self: TagsWidget) {
    //let session = this.notebookTracker.currentWidget.session;
    let notebookPanel = this.notebookTracker.currentWidget;
    let notebook = notebookPanel.notebook;
    //let cell:any;
    let first:boolean = true;
    for (let i=0; i< notebookPanel.model.cells.length; i++) {
      let currentCell = notebook.widgets[i] as Cell;//notebookPanel.model.cells.get(i);
      if (this.containsTag(this.selectedTagName, currentCell)) {
        if (first === true) {
          console.log("changing active cell");
          notebook.activeCellIndex= i;
          notebook.deselectAll();
          first =false;
        }
        else {
          notebook.select(notebook.widgets[i] as Cell);
        }
      }
    }
    /*
    for (cell in notebookPanel.model.cells) {
      let currentCell = cell as Cell;
      if (this.selectedTagName in cell.model.metadata.get("cells")) {
        if (first === true) {
          notebook.activeCellIndex= cellIndex;
          notebook.deselectAll();
          first =false;
        }
        else {
          notebook.select(ewfw)
        }
        cellIndex+=1;
      }
    } */
    console.log('selected all');
  }

  replaceName(newTag: string) {
    let oldTag = this.tagOldName;
    let notebook = this.notebookTracker.currentWidget;
    let cells = notebook.model.cells;
    for (var i=0; i<cells.length; i++) {
      let cellMetadata = cells.get(i).metadata;
      let cellTagsData = cellMetadata.get('tags') as string[];
      if (cellTagsData) {
        let results: string[] = [];
        for (var j=0; j<cellTagsData.length; j++) {
          if (cellTagsData[j] == oldTag) {
            results.push(newTag);
          } else {
            results.push(cellTagsData[j]);
          }
        }
        cellMetadata.set('tags', results);
      }
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
      _self.allTagsForSelectedCellNode.appendChild(node);
    }
  }

  didFinishAddingTags(name: string) {
    write_tag(this.currentActiveCell, name, true);
    this.addTagIntoAllTagsList(name);
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
        _self.addTagIntoAllTagsList(newTagInputs.value);
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

  addTagIntoAllTagsList(name: string) {
    if (this.allTagsInNotebook == null) {
      this.allTagsInNotebook = [name];
    } else {
      if (this.allTagsInNotebook.indexOf(name) < 0) {
        this.allTagsInNotebook.push(name);
      }
    }
  }

  getAllTagsInNotebook() {
    let notebook = this.notebookTracker.currentWidget;
    let cells = notebook.model.cells;
    this.allTagsInNotebook = null;
    for (var i=0; i<cells.length; i++) {
      let cellMetadata = cells.get(i).metadata;
      let cellTagsData = cellMetadata.get('tags') as string[];
      if (cellTagsData) {
        for (var j=0; j<cellTagsData.length; j++) {
          let name = cellTagsData[j];
          this.addTagIntoAllTagsList(name);
        }
      }
    }
    this.renderTagLabelsForAllTagsInNotebook(this.allTagsInNotebook);
  }

  loadTagLabels() {
    if (this.currentActiveCell != null) {
      let tags = this.currentActiveCell.model.metadata.get("tags");
      let renderedComponent = <TagsForSelectedCellComponent widget={this} tags={tags} />;
      ReactDOM.render(renderedComponent, this.tagsForSelectedCellNode);
    }
  }

  searchBoxValueDidChange(value: string) {
    var result: string[] = [];
    if (value.length == 0) {
      this.renderTagLabelsForAllTagsInNotebook(this.allTagsInNotebook);
      return;
    }
    for (var i=0; i<this.allTagsInNotebook.length; i++) {
      if (this.allTagsInNotebook[i].toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        result.push(this.allTagsInNotebook[i]);
      }
    }
    this.renderTagLabelsForAllTagsInNotebook(result);
  }

  renderTagLabelsForAllTagsInNotebook(tags: string[]) {
    let renderedComponent = <AllTagsInNotebookComponent widget={this} tags={tags} />
    ReactDOM.render(renderedComponent, this.allTagsHostNode);
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

  get allTagsHostNode() {
    return this.node.getElementsByClassName(ALL_TAGS_HOST_CLASS)[0] as HTMLElement;
  }

  get tagsForSelectedCellNode() {
    return this.node.getElementsByClassName(TAGS_FOR_CELL_HOST_CLASS)[0] as HTMLElement;
  }

  get allTagsForSelectedCellNode() {
    return this.node.getElementsByClassName(TAGS_COLLECTION_CLASS)[0];
  }

  get allTagsInNotebookNode() {
    return this.node.getElementsByClassName(TAGS_ALL_TAGS_IN_NOTEBOOK_CLASS)[0];
  }

  get selectedTagName() {
    if (this.selectedTag == null) {
      return null;
    }
    return this.selectedTag.getElementsByTagName('label')[0].innerHTML;
  }

  currentActiveCell: Cell = null;
  // selectedTags: string[] = [];

  allTagsInNotebook: [string] = null;
  private selectedTag: HTMLElement = null;
  private editingStatus = TAG_EDIT_STATUS_NULL;
  private tagOldName: string = null;
  public notebookTracker: INotebookTracker = null;
}

class TagsTool extends CellTools.Tool {

  constructor(notebook_Tracker: INotebookTracker, app: JupyterLab) {
    super();
    this.notebookTracker = notebook_Tracker;
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

  protected onAfterAttach() {
    this.notebookTracker.currentWidget.context.ready.then(() => {
      this.widget.getAllTagsInNotebook(); 
    });
    this.notebookTracker.currentChanged.connect(() => {
      this.widget.getAllTagsInNotebook(); 
    })
  }

  protected onMetadataChanged(msg: ObservableJSON.ChangeMessage): void {
    this.widget.loadTagLabels();
    this.widget.getAllTagsInNotebook();
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
  let tagsTool = new TagsTool(notebook_Tracker, app);
  cellTools.addItem({tool: tagsTool, rank: 1.7}) 
}

const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab-celltags',
  autoStart: true,
  requires: [ICellTools, INotebookTracker],
  activate: activate
};

export default extension;
