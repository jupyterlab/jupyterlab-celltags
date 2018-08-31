import { TagsWidget } from './tagswidget';

import { TagListComponent } from './tagslist';

import { PanelLayout } from '@phosphor/widgets';

import { CellTools, INotebookTracker } from '@jupyterlab/notebook';

import { Message } from '@phosphor/messaging';

import { ObservableJSON } from '@jupyterlab/observables';

import { JupyterLab } from '@jupyterlab/application';

import * as React from 'react';
import StyleClasses from './styles';

const TAG_TOOL_CLASS = 'jp-cellTags-Tools';
const TagsToolStyleClasses = StyleClasses.TagsToolStyleClasses;

export enum EditingStates {
  none,
  currentCell,
  allCells
}

export interface TagsToolComponentProps {
  widget: TagsWidget;
  tagsList: string | null;
  allTagsList: string[] | null;
}

export interface TagsToolComponentState {
  selected: any;
  editingSelectedTag: EditingStates;
  deletingTag: boolean;
}

export class TagsToolComponent extends React.Component<any, any> {
  constructor(props: TagsToolComponentProps) {
    super(props);
    this.state = {
      selected: null,
      editingSelectedTag: EditingStates.none,
      deletingTag: false
    };
    this.node = null;
  }

  componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false);
  }

  deletingTag = () => {
    if (this.state.selected !== null) {
      this.setState({ deletingTag: true });
    }
  };

  clickedDeleteTag = () => {
    this.setState({ deletingTag: false });
    this.setState({ selected: null });
    (this.props.widget as TagsWidget).removeTagFromAllCells(
      this.state.selected
    );
  };

  clickedRenameTag = () => {
    if ((this.state.selected as string) != null) {
      if (this.state.editingSelectedTag === EditingStates.none) {
        this.setState({ editingSelectedTag: EditingStates.allCells });
      } else {
        this.setState({ editingSelectedTag: EditingStates.none });
      }
    }
  };

  changeSelectionState = (newState: string) => {
    this.setState({ selected: newState });
  };

  changeEditingState = (newState: EditingStates) => {
    this.setState({ editingSelectedTag: newState });
  };

  changeDeletingState = (newState: boolean) => {
    this.setState({ deletingTag: newState });
  };

  handleClick = (e: any) => {
    if (this.node) {
      if (this.node.contains(e.target)) {
        return;
      }
      this.setState({ deletingTag: false });
      this.node = null;
    }
  };

  render() {
    const operationClass =
      this.state.selected === null || this.state.deletingTag === true
        ? TagsToolStyleClasses.tagOperationsNoSelectedStyleClass
        : TagsToolStyleClasses.tagOperationsOptionStyleClass;
    var deleteDiv =
      this.state.deletingTag === true ? (
        <div
          className={[
            TagsToolStyleClasses.bottomElementStyleClass,
            TagsToolStyleClasses.tagOperationsPopUpStyleClass
          ].join(' ')}
          ref={node => (this.node = node)}
        >
          Are you sure you want to delete this tag? <br />
          <button
            onClick={() => this.setState({ deletingTag: false })}
            className={TagsToolStyleClasses.cancelButtonStyleClass}
          >
            {' '}
            Cancel{' '}
          </button>
          <button
            onClick={() => this.clickedDeleteTag()}
            className={TagsToolStyleClasses.deleteButtonStyleClass}
          >
            Delete Tag{' '}
          </button>
        </div>
      ) : (
        <div
          className={[
            operationClass,
            TagsToolStyleClasses.bottomElementStyleClass
          ].join(' ')}
          onClick={event => {
            event.stopPropagation();
            this.props.widget.tagBlurNotHandled = false;
            this.deletingTag();
          }}
        >
          Delete Tag from All Cells
        </div>
      );
    return (
      <div>
        <TagListComponent
          widget={this.props.widget}
          allTagsList={this.props.allTagsList}
          tagsList={this.props.tagsList}
          selectionStateHandler={this.changeSelectionState}
          editingStateHandler={this.changeEditingState}
          deletingStateHandler={this.changeDeletingState}
          selectedTag={this.state.selected}
          editingSelectedTag={this.state.editingSelectedTag}
        />
        <div>
          <div
            className={operationClass}
            onClick={event => {
              event.stopPropagation();
              this.props.widget.tagBlurNotHandled = false;
              this.clickedRenameTag();
            }}
          >
            Rename Tag for All Cells
          </div>
          {deleteDiv}
        </div>
      </div>
    );
  }

  private node: any;
}

export class TagsTool extends CellTools.Tool {
  constructor(notebook_Tracker: INotebookTracker, app: JupyterLab) {
    super();
    this.notebookTracker = notebook_Tracker;
    let layout = (this.layout = new PanelLayout());
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

  protected onAfterShow() {
    this.widget.getAllTagsInNotebook();
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
      this.widget.validateMetadataForActiveCell();
      this.widget.loadTagsForActiveCell();
      this.widget.getAllTagsInNotebook();
    }
  }

  private widget: TagsWidget = null;
  public notebookTracker: INotebookTracker = null;
}
