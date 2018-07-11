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
  write_tag
} from './celltags';

import * as React from 'react';

import * as ReactDOM from 'react-dom';

import '../style/index.css';

const TAG_TOOL_CLASS = 'jp-cellTags-Tools';
const TAG_LABEL_DIV_CLASS = 'jp-cellTags-unselected-tag';
const TAG_SELECTED_LABEL_DIV_CLASS = 'jp-cellTags-selected-tag';
const TAG_ADD_DIV = 'jp-cellTags-tag-add';
const TAG_INPUT = 'jp-cellTags-tag-input';

abstract class TagComponent extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
  }

  abstract singleCellOperationHandler(name: string): void;
  abstract singleCellOperationButton(name: string, operation: (event: React.MouseEvent<any>) => void): JSX.Element;

  render() {
    const inputShouldShow = this.props.inputShouldShow as boolean;
    const tag = this.props.tag as string;
    return (
      <div>
        <label ref={ (label) => inputShouldShow && label && label.focus() }
          contentEditable={ inputShouldShow } 
          onFocus={ (event) => document.execCommand('selectAll', false, null) }
          onKeyDown={ (event) => {
            if (event.keyCode == 13) {
              let value = (event.target as HTMLLabelElement).innerHTML;
              this.props.finishEditingHandler(value);
            }
          } }
          onBlur={ (event) => {
            let inputElement = event.target as HTMLLabelElement;
            inputElement.innerHTML = tag;
            this.setState({ editingSelectedTag: false });
          } }
        >{ tag }</label>
        <label>{ this.singleCellOperationButton(tag, ((event: React.MouseEvent<any>) => {
          event.stopPropagation();
          this.singleCellOperationHandler(tag); 
        })) }</label>
      </div>
    )
  }

}

class TagForActiveCellComponent extends TagComponent {

  singleCellOperationHandler(name: string) {
    (this.props.widget as TagsWidget).addTagToActiveCell(name);
  }

  singleCellOperationButton(name: string, operation: (event: React.MouseEvent<any>) => void) {
    if (this.props.selectedTag as string === name) {
      return <img onClick={ (event) => operation(event) } src={ require("../static/white_addcircle.svg") } className="tag-icon"/>;
    } else {
      return <img onClick={ (event) => operation(event) } src={ require("../static/darkgrey_addcircle.svg") } className="tag-icon"/>;
    }
  }

}

class TagForAllCellsComponent extends TagComponent {

  singleCellOperationHandler(name: string) {
    // TODO: set state to null
    if (name !== null) {
      (this.props.widget as TagsWidget).removeTagForSelectedCellWithName(name);
    }
  }

  singleCellOperationButton(name: string, operation: (event: React.MouseEvent<any>) => void) {
    if (this.props.selectedTag as string === name) {
      return <img onClick={ (event) => operation(event) } src={ require("../static/white_minuscircle.svg") } className="tag-icon" />;
    } else {
      return <img onClick={ (event) => operation(event) } src={require("../static/darkgrey_minuscircle.svg")} className="tag-icon"/>;
    }
  }

}

class AddTagComponent extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
    this.state = { plusIconShouldHide: false };
  }

  didFinishAddingTagWithName(name: string) {
    (this.props.widget as TagsWidget).didFinishAddingTags(name);
  }

  addTagOnClick(event: React.MouseEvent<HTMLInputElement>) {
    this.setState({ plusIconShouldHide: true });
    let inputElement = event.target as HTMLInputElement;
    if (inputElement.value === 'Add Tag') {
      inputElement.value = '';
      inputElement.style.width = '63px';
      inputElement.style.minWidth = '63px';
    }
  }

  addTagOnKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    let inputElement = event.target as HTMLInputElement;
    let tmp = document.createElement('span');
    tmp.className = TAG_INPUT;
    tmp.innerHTML = inputElement.value;
    document.body.appendChild(tmp);
    inputElement.style.width = (tmp.getBoundingClientRect().width + 8) + "px";
    document.body.removeChild(tmp);
    if (event.keyCode == 13) {
      let value = inputElement.value;
      inputElement.value = '';
      this.didFinishAddingTagWithName(value);
      inputElement.value = 'Add Tag';
      inputElement.style.width = '50px';
      inputElement.style.minWidth = '50px';
      inputElement.blur();
      this.setState({ plusIconShouldHide: false });
    }
  }

  addTagOnBlur(event:React.FocusEvent<HTMLInputElement>) {
    let inputElement = event.target as HTMLInputElement;
    inputElement.value = 'Add Tag';
    inputElement.style.width = '50px';
    inputElement.style.minWidth = '50px';
    inputElement.blur();
    this.setState({ plusIconShouldHide: false });
  }

  render() {
    return (
      <div className={ TAG_ADD_DIV } >
        <input className={ TAG_INPUT }
          defaultValue='Add Tag'
          onClick={(event) => this.addTagOnClick(event)}
          onKeyDown={ (event) => this.addTagOnKeyDown(event)}
          onBlur = { (event) => this.addTagOnBlur(event)} 
        />
        <label className={"add-tag-box"} hidden={ this.state.plusIconShouldHide }>  +</label>
      </div>
    );
  }

}

class TagListComponent extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
    this.didfinishEditingTagName = this.didfinishEditingTagName.bind(this);
    this.state = { selected: this.props.selectedTag };
  }

  didSelectTagWithName(name: string) {
    if ((!(this.props.editingSelectedTag)) || (this.props.selectedTag != name)) {
      this.props.selectionStateHandler(name);
      this.props.editingStateHandler(false);
    }
    if (this.props.selectedTag === name && (!(this.props.editingSelectedTag as boolean))) {
      this.props.selectionStateHandler(null);
      this.props.editingStateHandler(false);
    }
  }

  didfinishEditingTagName(newName: string) {
    this.props.editingStateHandler(false);
    (this.props.widget as TagsWidget).replaceName(this.props.selectedTag, newName);
    this.props.selectionStateHandler(newName);
  }

  tagAlreadyInActiveCellTagsList(name: string) {
    return (this.props.widget as TagsWidget).activeCellContainsTag(name);
  }

  renderElementForTags(tags: string[], TagType: typeof TagComponent) {
    const selectedTag = this.props.selectedTag;
    return tags.map((tag, index) => {
      const tagClass = (selectedTag === tag) ? TAG_SELECTED_LABEL_DIV_CLASS : TAG_LABEL_DIV_CLASS;
      const inputShouldShow = (selectedTag === tag) && (this.props.editingSelectedTag as boolean);
      return (
        <div key={ tag } className={ tagClass } onClick={ (event) => this.didSelectTagWithName(tag)}>
          <TagType widget={ this.props.widget }
            finishEditingHandler={ this.didfinishEditingTagName } 
            selectedTag={ this.props.selectedTag }
            inputShouldShow={ inputShouldShow }
            tag={ tag }
          />
        </div>
      );
    });
  }

  render() {
    let allTagsList = this.props.allTagsList as string[];
    let otherTagsList: string[] =[];
    if (allTagsList) {
      for (let i=0; i < allTagsList.length; i++) {
        if (!this.tagAlreadyInActiveCellTagsList(allTagsList[i])) {
          otherTagsList.push(allTagsList[i])
        }
      }
    }
    var renderedTagsForActiveCell = null;
    if (otherTagsList != null) {
      renderedTagsForActiveCell = this.renderElementForTags(otherTagsList, TagForActiveCellComponent);
    }
    var renderedTagsForAllCells = null;
    if (this.props.tagsList != null) {
      let tags = (this.props.tagsList as string).toString().split(',');
      renderedTagsForAllCells = this.renderElementForTags(tags, TagForAllCellsComponent);
    }
    return (
      <div>
        <div className="tag-sub-header">Tags in Active Cell</div>
        <div className="tag-holder">
          { renderedTagsForAllCells }
          <AddTagComponent widget={ this.props.widget } />
        </div>
        <div className="tag-sub-header">Other Tags in Notebook</div>
        <div>
          <div className="tag-holder">
          { renderedTagsForActiveCell }
          </div>
        </div>
      </div>
    );
  }

}

class TagsToolComponent extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
    this.state = { selected: null, editingSelectedTag: false };
    this.changeEditingState = this.changeEditingState.bind(this);
    this.changeSelectionState = this.changeSelectionState.bind(this);
  }

  didClickDeleteTag() {
    this.setState({ selected: null });
    (this.props.widget as TagsWidget).removeTagFromAllCells(this.state.selected);
  }

  didClickRenameTag() {
    if (this.state.selected as string != null) {
      if (this.state.editingSelectedTag === false) {
        this.setState({ editingSelectedTag: true });
      } else {
        this.setState({ editingSelectedTag: false });
      }
    }
  }

  changeSelectionState(newState: string) {
    this.setState({ selected: newState });
  }

  changeEditingState(newState: boolean) {
    this.setState({ editingSelectedTag: newState });
  }

  render() {
    const operationClass = (this.state.selected === null) ? "tag-operations-no-selected": "tag-operations-option";
    return (
      <div>
        <span><div className="tag-header">Tags</div><hr className={"tag-header-hr"}/></span>
        <TagListComponent widget={ this.props.widget }
          allTagsList={ this.props.allTagsList }
          tagsList={ this.props.tagsList }
          selectionStateHandler={ this.changeSelectionState }
          editingStateHandler={ this.changeEditingState }
          selectedTag={ this.state.selected }
          editingSelectedTag={ this.state.editingSelectedTag }
        />
        <div>
          <div className={ operationClass} onClick={ () => this.didClickRenameTag() }>
            Rename Tag for All Cells
          </div> 
          <div className={ operationClass } onClick={ () => this.didClickDeleteTag() }>
            Delete Tag from All Cells
          </div> 
        </div>
      </div>
    );
  }
}

class TagsWidget extends Widget {

  constructor(notebook_Tracker: INotebookTracker) {
    super();
    this.notebookTracker = notebook_Tracker;
    Private.setWidget(this);
    Private.renderAllTagsNode();
  }

  containsTag(tag:string, cell: Cell) {
    if (cell === null) {
      return false;
    }
    let tagList = cell.model.metadata.get("tags") as string[];
    if (tagList) {
      for (let i=0; i< tagList.length; i++){
        if (tagList[i] === tag) {
          return true;
        }
      }
      return false;
    }
  }

  activeCellContainsTag(tag: string) {
    return this.containsTag(tag, this.currentActiveCell);
  }

  selectAll(name: string) {
    let notebookPanel = this.notebookTracker.currentWidget;
    let notebook = notebookPanel.notebook;
    let first:boolean = true;
    for (let i=0; i< notebookPanel.model.cells.length; i++) {
      let currentCell = notebook.widgets[i] as Cell;
      if (this.containsTag(name, currentCell)) {
        if (first === true) {
          notebook.activeCellIndex= i;
          notebook.deselectAll();
          first =false;
        }
        else {
          notebook.select(notebook.widgets[i] as Cell);
        }
      }
    }
  }

  replaceName(oldTag: string, newTag: string) {
    let notebook = this.notebookTracker.currentWidget;
    let cells = notebook.model.cells;
    this.tagsListShallNotRefresh = true;
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
    this.loadTagsForActiveCell();
    this.getAllTagsInNotebook();
    this.tagsListShallNotRefresh = false;
  }

  didFinishAddingTags(name: string) {
    write_tag(this.currentActiveCell, name, true);
    let new_tags = name.split(/[,\s]+/);
    for (var i=0; i < new_tags.length; i++) {
      this.addTagIntoAllTagsList(new_tags[i]);
    }
  }

  removeTagForSelectedCellWithName(name: string) {
    write_tag(this.currentActiveCell, name, false);
  }

  removeTagFromAllCells(name:string) {
    let notebookPanel = this.notebookTracker.currentWidget;
    let notebook = notebookPanel.notebook;
    this.tagsListShallNotRefresh = true;
    for (let i=0; i< notebookPanel.model.cells.length; i++) {
      let currentCell = notebook.widgets[i] as Cell;
      if (this.containsTag(name, currentCell)) {
        write_tag(currentCell, name, false);
      }
    }
    this.tagsListShallNotRefresh = false;
    this.loadTagsForActiveCell();
    this.getAllTagsInNotebook();
  }

  addTagIntoAllTagsList(name: string) {
    if (name === "") {
      return;
    } else if (this.allTagsInNotebook == null) {
      this.allTagsInNotebook = [name];
    } else {
      if (this.allTagsInNotebook.indexOf(name) < 0) {
        this.allTagsInNotebook.push(name);
      }
    }
  }

  addTagToActiveCell(name:string) {
    write_tag(this.currentActiveCell, name, true);
    this.loadTagsForActiveCell();
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

  loadTagsForActiveCell() {
    if (this.currentActiveCell != null) {
      let tags = this.currentActiveCell.model.metadata.get("tags");
      Private.setTagsListFor(Private.TAGS_FOR_CELL, tags);
    }
  }

  renderTagLabelsForAllTagsInNotebook(tags: string[]) {
    Private.setTagsListFor(Private.ALL_TAGS, tags);
  }

  currentActiveCell: Cell = null;
  allTagsInNotebook: [string] = null;
  notebookTracker: INotebookTracker = null;
  tagsListShallNotRefresh = false;

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

  /**
   * Handle a change to the active cell.
   */
  protected onActiveCellChanged(msg: Message): void {
    this.widget.currentActiveCell = this.parent.activeCell;
    this.widget.loadTagsForActiveCell();
  }

  protected onAfterAttach() {
    this.notebookTracker.currentWidget.context.ready.then(() => {
      this.widget.getAllTagsInNotebook(); 
    });
    this.notebookTracker.currentChanged.connect(() => {
      this.widget.getAllTagsInNotebook(); 
    });
  }

  protected onMetadataChanged(msg: ObservableJSON.ChangeMessage): void {
    if (!this.widget.tagsListShallNotRefresh) {
      this.widget.loadTagsForActiveCell();
      this.widget.getAllTagsInNotebook();
    }
  }

  private widget: TagsWidget = null;
  public notebookTracker: INotebookTracker = null;
}

namespace TagsTool {
  /**
   * The options used to initialize a metadata editor tool.
   */

}

namespace Private {

  let widget: TagsWidget = null;
  let tagsList: any = [];
  let allTagsList: any[] = [];

  export const ALL_TAGS = 0;
  export const TAGS_FOR_CELL = 1;

  export
  function setTagsListFor(type: number, list: any) {
    switch (type) {
      case ALL_TAGS:
        allTagsList = list;
        break;
      case TAGS_FOR_CELL:
        tagsList = list;
        break;
    }
    renderAllTagsNode();
  }

  export
  function setWidget(currentWidget: TagsWidget) {
    widget = currentWidget;
  }

  export
  function renderAllTagsNode() {
    ReactDOM.render((<TagsToolComponent widget={ widget } tagsList={ tagsList } allTagsList={ allTagsList } />), widget.node);
  }
}

/**
 * Initialization data for the jupyterlab-celltags extension.
 */
function activate(app: JupyterLab, cellTools: ICellTools, notebook_Tracker: INotebookTracker) {
  let tagsTool = new TagsTool(notebook_Tracker, app);
  cellTools.addItem({tool: tagsTool, rank: 1.7});
}

const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab-celltags',
  autoStart: true,
  requires: [ICellTools, INotebookTracker],
  activate: activate
};

export default extension;
