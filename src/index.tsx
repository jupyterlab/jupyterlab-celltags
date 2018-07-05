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
  const TAG_LABEL_DIV_CLASS = 'jp-cellTags-tag-label-div';
  const TAG_SELECTED_LABEL_DIV_CLASS = 'jp-cellTags-selected-tag-label-div';
  const TAG_ADD_TAG_BUTTON_CLASS = 'jp-cellTags-add-tag-button';
  const TAG_BUTTON_CLASS = 'jp-cellTags-button';
  const TAG_INPUT = 'jp-cellTags-tag-input';
  
  class TagsToolComponent extends React.Component<any, any> {
  
    constructor(props: any) {
      super(props);
      this.state = { selectedTag: null };
      this.handleSelectingTag = this.handleSelectingTag.bind(this);
    }
  
    handleSelectingTag(name: string) {
      if (this.state.selectedTag == null || this.state.selectedTag != name) {
        this.setState({ selectedTag: name });
      } else {
        this.setState({ selectedTag: null });
      }
    }
  
    render() {
      return (
        <div>
          <span className="tag-header">All Tags In Notebook </span><hr className="tag-header-hr"/>
          <TagsForSelectedCellComponent widget={ this.props.widget } tags={ this.props.tagsList } 
            selected={ this.state.selectedTag } selectHandler={ this.handleSelectingTag } />
          <span>All Tags In Notebook: </span>
          <AllTagsInNotebookComponent widget={ this.props.widget } tags={ this.props.allTagsList } 
            selected={ this.state.selectedTag } selectHandler={ this.handleSelectingTag } />
          <div className="tag-section"><p> Operations will go here</p> </div>
        </div>
      );
    }
  
  }
  
  class TagsComponent extends React.Component<any, any> {
  
    constructor(props: any) {
      super(props);
      this.state = { editingSelectedTag: false };
    }
  
    didSelectTagWithName(name: string) {
      if ((!this.state.editingSelectedTag) || (this.props.selected != name)) {
        this.setState({ editingSelectedTag: false });
        this.props.selectHandler(name);
      }
    }
  
    didfinishEditingTagName(newName: string) {
      this.setState({ editingSelectedTag: false });
      (this.props.widget as TagsWidget).replaceName(this.props.selected, newName);
      this.props.selectHandler(newName);
    }
  
    didPressedKeyIn(event: React.KeyboardEvent<HTMLInputElement>) {
      if (event.keyCode == 13) {
        let value = (event.target as HTMLInputElement).value;
        this.didfinishEditingTagName(value);
      }
    }
  
    renderElementForTags(tags: string[]) {
      const selectedTag = this.props.selected as string;
      return tags.map((tag, index) => {
        const tagClass = (selectedTag === tag) ? TAG_SELECTED_LABEL_DIV_CLASS : TAG_LABEL_DIV_CLASS;
        const inputShouldShow = (selectedTag === tag) && (this.state.editingSelectedTag);
        return (
          <div
            key={ tag }
            className={ tagClass }
            onClick={ (event) =>
              this.didSelectTagWithName(tag)
            }
          >
            <label hidden={ inputShouldShow }>{ tag }</label>
            <input hidden={ !inputShouldShow } className={ TAG_INPUT } defaultValue={ tag } 
              onKeyDown={ (event) => this.didPressedKeyIn(event) } />
          </div>
        );
      });
    }
  
  }
    
  class AllTagsInNotebookComponent extends TagsComponent {
  
    constructor(props: any) {
      super(props);
    }
  
    didClickRenameTag() {
      if (this.props.selected as string != null) {
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
        <div className="tag-section">
          <button 
            className={ TAG_BUTTON_CLASS }
            onClick={ () => (this.props.widget as TagsWidget).selectAll(this.props.selected) }
          >
            Select All
          </button>
          <button 
            className={ TAG_BUTTON_CLASS }
            onClick={ () => this.didClickRenameTag() }
          >
            Rename
          </button> 
          <div className="tag-holder">
          { renderedTags }
          </div>
        </div>
      );
    }
  
  }
  
  class TagsForSelectedCellComponent extends TagsComponent {
  
    constructor(props: any) {
      super(props);
      this.state = { editingSelectedTag: false, pendingInput: false };
    }
  
    didFinishAddingTagWithName(name: string) {
      this.setState({ pendingInput: false });
      (this.props.widget as TagsWidget).didFinishAddingTags(name);
    }
  
    removeSelectedTagFromCell() {
      if (this.props.selected as string != null) {
        (this.props.widget as TagsWidget).removeTagForSelectedCellWithName(this.props.selected as string);
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
        <div className="tag-section">
          { renderedTools }
          <div className="tag-holder">{ renderedTags } </div>
          <input className={ TAG_INPUT } hidden={ !this.state.pendingInput } 
            onKeyDown={ (event) => this.didPressedKeyIn(event) } />
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