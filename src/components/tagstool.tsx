import {
  TagsWidget
} from './tagswidget';

import {
  TagListComponent
} from './tagslist';

import {
  PanelLayout
} from '@phosphor/widgets';

import {
  CellTools, INotebookTracker
} from '@jupyterlab/notebook';

import {
  Message
} from '@phosphor/messaging';

import {
  ObservableJSON
} from '@jupyterlab/observables';

import {
  JupyterLab
} from '@jupyterlab/application';

import * as React from 'react';
import StyleClasses from './styles';

const TAG_TOOL_CLASS = 'jp-cellTags-Tools';
const TagsToolStyleClasses = StyleClasses.TagsToolStyleClasses;

export
class TagsToolComponent extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
    this.state = { 
      selected: null, 
      editingSelectedTag: false, 
      deletingTag: false
    };
    this.node =null;
    this.changeEditingState = this.changeEditingState.bind(this);
    this.changeSelectionState = this.changeSelectionState.bind(this);
    this.changeDeletingState = this.changeDeletingState.bind(this);
  }
  private node: any;

  deletingTag() {
    if (this.state.selected !== null) {
      this.setState({ deletingTag: true });
    }
  }

  clickedDeleteTag() {
    this.setState({ deletingTag: false });
    this.setState({ selected: null });
    (this.props.widget as TagsWidget).removeTagFromAllCells(this.state.selected);
  }

  clickedRenameTag() {
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

  changeDeletingState(newState: boolean) {
    this.setState({ deletingTag: newState });
  }

  componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false);
  }

  handleClick = (e:any) => {
    if (this.node) {
      if (this.node.contains(e.target)) {
        return;
      }
      this.setState({deletingTag:false});
      this.node=null;
    }
  }

  render() {
    const operationClass = (this.state.selected === null 
                          || this.state.deletingTag === true) 
                         ? TagsToolStyleClasses.tagOperationsNoSelectedStyleClass
                         : TagsToolStyleClasses.tagOperationsOptionStyleClass;
    var deleteDiv = (this.state.deletingTag === true) 
                  ? (<div className={ [
                        TagsToolStyleClasses.bottomElementStyleClass,
                        TagsToolStyleClasses.tagOperationsPopUpStyleClass
                      ].join(' ') } 
                      ref={ node => this.node=node }
                     >
                      Are you sure you want to delete this tag? <br />
                      <button 
                        onClick={ () => this.setState({ deletingTag: false }) } 
                        className={ TagsToolStyleClasses.cancelButtonStyleClass }
                      > 
                       Cancel 
                      </button> 
                      <button 
                        onClick={ () => this.clickedDeleteTag() } 
                        className={ TagsToolStyleClasses.deleteButtonStyleClass }
                      >
                       Delete Tag 
                      </button> 
                    </div>)
                  : (<div className={ [
                        operationClass,
                        TagsToolStyleClasses.bottomElementStyleClass
                      ].join(' ') }
                      onClick={ () => this.deletingTag() }
                     >
                      Delete Tag from All Cells
                    </div>);
    return (
      <div>
        <span>
            <div className={ TagsToolStyleClasses.tagHeaderStyleClass }>
              Tags
            </div>
            <hr className={ TagsToolStyleClasses.tagHeaderHrStyleClass }/>
        </span>
        <TagListComponent widget={ this.props.widget }
          allTagsList={ this.props.allTagsList }
          tagsList={ this.props.tagsList }
          selectionStateHandler={ this.changeSelectionState }
          editingStateHandler={ this.changeEditingState }
          deletingStateHandler={ this.changeDeletingState }
          selectedTag={ this.state.selected }
          editingSelectedTag={ this.state.editingSelectedTag }
        />
        <div>
          <div className={ operationClass} onClick={ 
              () => this.clickedRenameTag() 
          }>
            Rename Tag for All Cells
          </div> 
          { deleteDiv }
        </div>
      </div>
    );
  }
}

export
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
    this.notebookTracker.currentWidget.model.cells.changed.connect(() => {
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
