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

const TAG_TOOL_CLASS = 'jp-cellTags-Tools';

export
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
    const operationClass = (this.state.selected === null) 
                         ? "tag-operations-no-selected"
                         : "tag-operations-option";
    return (
      <div>
        <span>
            <div className="tag-header">Tags</div>
            <hr className={ "tag-header-hr" }/>
        </span>
        <TagListComponent widget={ this.props.widget }
          allTagsList={ this.props.allTagsList }
          tagsList={ this.props.tagsList }
          selectionStateHandler={ this.changeSelectionState }
          editingStateHandler={ this.changeEditingState }
          selectedTag={ this.state.selected }
          editingSelectedTag={ this.state.editingSelectedTag }
        />
        <div>
          <div className={ operationClass} onClick={ 
              () => this.didClickRenameTag() 
          }>
            Rename Tag for All Cells
          </div> 
          <div id= { "bottom" } 
            className={ operationClass } 
            onClick={ () => this.didClickDeleteTag() }
          >
            Delete Tag from All Cells
          </div> 
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
