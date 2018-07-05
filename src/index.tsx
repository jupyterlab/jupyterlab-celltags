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

const TAG_TOOL_CLASS = 'jp-cellTags-Tools';
const HEADER_CLASS = 'jp-cellTags-header';
const ALL_TAGS_HOST_CLASS = 'jp-cellTags-all-tags-host';
const TAGS_FOR_CELL_HOST_CLASS = 'jp-cellTags-tags-for-cell-host';
const TAG_LABEL_DIV_CLASS = 'jp-cellTags-tag-label-div';
const TAG_ADD_TAG_BUTTON_CLASS = 'jp-cellTags-add-tag-button';
const TAG_BUTTON_CLASS = 'jp-cellTags-button';
const TAG_INPUT = 'jp-cellTags-tag-input';

class TagsComponent extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
    this.state = { selectedTag: null, editingSelectedTag: false };
  }

  didSelectTagWithName(name: string) {
    if ((!this.state.editingSelectedTag) || (this.state.selectedTag != name)) {
      this.setState({ editingSelectedTag: false });
      this.setState({ selectedTag: name });
    }
  }

  didfinishEditingTagName(newName: string) {
    this.setState({ editingSelectedTag: false });
    this.setState({ selectedTag: newName });
    (this.props.widget as TagsWidget).replaceName(this.state.selectedTag, newName);
  }

  didPressedKeyIn(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.keyCode == 13) {
      let value = (event.target as HTMLInputElement).value;
      this.didfinishEditingTagName(value);
    }
  }

  renderElementForTags(tags: string[]) {
    const { selectedTag } = this.state;
    return tags.map((tag, index) => {
      const style = (selectedTag === tag)
                     ? { backgroundColor: "red" }
                     : { backgroundColor: "white" };
      const inputShouldShow = (selectedTag === tag) && (this.state.editingSelectedTag);
      return (
        <div
          key={ tag }
          className={ TAG_LABEL_DIV_CLASS }
          style={ style }
          onClick={ (event) =>
            this.didSelectTagWithName(tag)
          }
        >
          <label hidden={ inputShouldShow }>{ tag }</label>
          <input hidden={ !inputShouldShow } className={ TAG_INPUT } defaultValue={ tag } onKeyDown={ (event) => this.didPressedKeyIn(event) } />
        </div>
      );
    });
  }

}
  
class AllTagsInNotebookComponent extends TagsComponent {

  constructor(props: any) {
    super(props);
    this.state = { selectedTag: null };
  }

  didClickRenameTag() {
    if (this.state.selectedTag != null) {
      this.setState({ editingSelectedTag: true });
    }
  }

  render() {
    let tags = this.props.tags as string[];
    var renderedTags = null;
    if (tags != null) {
      renderedTags = this.renderElementForTags(tags);
    }
    return (
      <div>
        <button 
          className={ TAG_BUTTON_CLASS }
          onClick={ () => (this.props.widget as TagsWidget).selectAll(this.state.selectedTag) }
        >
          Select All
        </button>
        <button 
          className={ TAG_BUTTON_CLASS }
          onClick={ () => this.didClickRenameTag() }
        >
          Rename
        </button>
        { renderedTags }
      </div>
    );
  }

}

class TagsForSelectedCellComponent extends TagsComponent {

  constructor(props: any) {
    super(props);
    this.state = { selectedTag: null, editingSelectedTag: false, pendingInput: false };
  }

  didFinishAddingTagWithName(name: string) {
    this.setState({ pendingInput: false });
    (this.props.widget as TagsWidget).didFinishAddingTags(name);
  }

  removeSelectedTagFromCell() {
    if (this.state.selectedTag != null) {
      (this.props.widget as TagsWidget).removeTagForSelectedCellWithName(this.state.selectedTag);
    }
  }

  didPressedKeyIn(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.keyCode == 13) {
      let value = (event.target as HTMLInputElement).value;
      (event.target as HTMLInputElement).value = '';
      this.didFinishAddingTagWithName(value);
    }
  }

  render() {
    var renderedTags = null;
    var renderedTools = (
      <div>
        <button 
          className={ TAG_ADD_TAG_BUTTON_CLASS }
          onClick={ () => this.setState( { pendingInput: true } ) }
        >
          Add
        </button>
        <button 
          className={ TAG_BUTTON_CLASS }
          onClick={ () => this.removeSelectedTagFromCell() }
        >
          Remove
        </button>
      </div>
    );
    if (this.props.tags != null) {
      let tags = (this.props.tags as string).toString().split(',');
      renderedTags = this.renderElementForTags(tags);
    }
    return (
      <div>
        { renderedTools }
        { renderedTags }
        <input className={ TAG_INPUT } hidden={ !this.state.pendingInput } onKeyDown={ (event) => this.didPressedKeyIn(event) } />
      </div>
    );
  }

}

class TagsWidget extends Widget {

  constructor(notebook_Tracker: INotebookTracker) {
    super();
    this.notebookTracker = notebook_Tracker;
    ReactDOM.render(Private.createAllTagsNode(), this.node);
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

  selectAll(name: string) {
    let notebookPanel = this.notebookTracker.currentWidget;
    let notebook = notebookPanel.notebook;
    let first:boolean = true;
    for (let i=0; i< notebookPanel.model.cells.length; i++) {
      let currentCell = notebook.widgets[i] as Cell;//notebookPanel.model.cells.get(i);
      if (this.containsTag(name, currentCell)) {
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
    console.log('selected all');
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
    this.addTagIntoAllTagsList(name);
  }

  removeTagForSelectedCellWithName(name: string) {
    write_tag(this.currentActiveCell, name, false);
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

  loadTagsForActiveCell() {
    if (this.currentActiveCell != null) {
      let tags = this.currentActiveCell.model.metadata.get("tags");
      let renderedComponent = <TagsForSelectedCellComponent widget={this} tags={tags} />;
      ReactDOM.render(renderedComponent, this.tagsForSelectedCellNode);
    }
  }

  renderTagLabelsForAllTagsInNotebook(tags: string[]) {
    let renderedComponent = <AllTagsInNotebookComponent widget={this} tags={tags} />
    ReactDOM.render(renderedComponent, this.allTagsHostNode);
  }

  get allTagsHostNode() {
    return this.node.getElementsByClassName(ALL_TAGS_HOST_CLASS)[0] as HTMLElement;
  }

  get tagsForSelectedCellNode() {
    return this.node.getElementsByClassName(TAGS_FOR_CELL_HOST_CLASS)[0] as HTMLElement;
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
    })
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

namespace Private {

  export
  function createAllTagsNode() {
    const title = 'Tags';
    return (
      <React.Fragment>
        <div className={ HEADER_CLASS }>
          <span className={ HEADER_CLASS }>{ title }</span>
        </div>
        <span>Tags for Selected Cell: </span>
        <div className={ TAGS_FOR_CELL_HOST_CLASS }></div>
        <span>All Tags In Notebook: </span>
        <div className={ ALL_TAGS_HOST_CLASS }></div>
      </React.Fragment>
    );
  }

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
