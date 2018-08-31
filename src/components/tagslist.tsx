import {
  TagComponent,
  TagForActiveCellComponent,
  TagForAllCellsComponent,
  AddTagComponent
} from './tag';

import { TagsWidget } from './tagswidget';

import { EditingStates } from './tagstool';

import * as React from 'react';
import StyleClasses from './styles';

const TagListStyleClasses = StyleClasses.TagListStyleClasses;

export interface TagListComponentProps {
  widget: TagsWidget;
  selectedTag: string | null;
  editingSelectedTag: EditingStates;
  selectionStateHandler: (newState: string) => void;
  editingStateHandler: (newState: EditingStates) => void;
  deletingStateHandler: (newState: boolean) => void;
  allTagsList: string[] | null;
  tagsList: string | null;
}

export interface TagListComponentState {
  selected: string | null;
}

export class TagListComponent extends React.Component<any, any> {
  constructor(props: TagListComponentProps) {
    super(props);
    this.blurTimer = null;
    this.state = { selected: this.props.selectedTag };
  }

  selectedTagWithName = (name: string) => {
    if (
      this.props.selectedTag === name &&
      this.props.editingSelectedTag === EditingStates.none
    ) {
      this.props.selectionStateHandler(null);
      this.props.editingStateHandler(EditingStates.none);
    } else if (
      this.props.editingSelectedTag === EditingStates.none ||
      this.props.selectedTag != name
    ) {
      this.props.selectionStateHandler(name);
      this.props.editingStateHandler(EditingStates.none);
    }
    this.props.deletingStateHandler(false);
  };

  editedTagName = (newName: string) => {
    let widget = this.props.widget;
    this.props.editingStateHandler(EditingStates.none);
    if (this.props.editingSelectedTag === EditingStates.allCells) {
      widget.replaceNameForAllCells(this.props.selectedTag, newName);
    } else if (this.props.editingSelectedTag === EditingStates.currentCell) {
      widget.replaceNameForActiveCell(this.props.selectedTag, newName);
    }
    this.props.selectionStateHandler(null);
  };

  tagInActiveCell = (name: string) => {
    return this.props.widget.activeCellContainsTag(name);
  };

  renderElementForTags = (tags: string[], TagType: typeof TagComponent) => {
    const selectedTag = this.props.selectedTag;
    const _self = this;
    return tags.map((tag, index) => {
      let tagClass =
        selectedTag === tag
          ? TagListStyleClasses.selectedTagStyleClass
          : TagListStyleClasses.unselectedTagStyleClass;
      const inputShouldShow =
        selectedTag === tag &&
        this.props.editingSelectedTag != EditingStates.none;
      if (inputShouldShow) {
        tagClass = TagListStyleClasses.editTagStyleClass;
      }
      return (
        <div
          key={tag}
          className={tagClass}
          onClick={event => {
            if (
              !(
                this.props.selectedTag === tag &&
                this.props.editingSelectedTag != EditingStates.none
              )
            ) {
              this.props.widget.tagBlurNotHandled = false;
              this.selectedTagWithName(tag);
            }
          }}
          onBlur={event => {
            this.props.widget.tagBlurNotHandled = true;
            if (this.blurTimer) {
              clearTimeout(this.blurTimer);
            }
            this.blurTimer = setTimeout(function() {
              if (
                _self.props.selectedTag === tag &&
                _self.props.widget.tagBlurNotHandled
              ) {
                _self.props.selectionStateHandler(null);
              }
            }, 145);
          }}
          tabIndex={-1}
        >
          <TagType
            widget={this.props.widget}
            finishEditingHandler={this.editedTagName}
            selectionStateHandler={this.props.selectionStateHandler}
            editingStateHandler={this.props.editingStateHandler}
            selectedTag={this.props.selectedTag}
            inputShouldShow={inputShouldShow}
            tag={tag}
          />
        </div>
      );
    });
  };

  render() {
    let allTagsList = this.props.allTagsList;
    let otherTagsList: string[] = [];
    if (allTagsList) {
      for (let i = 0; i < allTagsList.length; i++) {
        if (!this.tagInActiveCell(allTagsList[i])) {
          otherTagsList.push(allTagsList[i]);
        }
      }
    }
    var renderedTagsForAllCells = null;
    if (otherTagsList != null) {
      renderedTagsForAllCells = this.renderElementForTags(
        otherTagsList,
        TagForAllCellsComponent
      );
    }
    var renderedTagsForActiveCell = null;
    if (this.props.tagsList != null) {
      let tags = (this.props.tagsList as string).toString().split(',');
      renderedTagsForActiveCell = this.renderElementForTags(
        tags,
        TagForActiveCellComponent
      );
    }
    return (
      <div>
        <div className={TagListStyleClasses.tagSubHeaderStyleClass}>
          Tags in Active Cell
        </div>
        <div className={TagListStyleClasses.tagHolderStyleClass}>
          {renderedTagsForActiveCell}
          <AddTagComponent widget={this.props.widget} />
        </div>
        <div className={TagListStyleClasses.tagSubHeaderStyleClass}>
          Other Tags in Notebook
        </div>
        <div>
          <div className={TagListStyleClasses.tagHolderStyleClass}>
            {renderedTagsForAllCells}
          </div>
        </div>
      </div>
    );
  }

  private blurTimer: NodeJS.Timer = null;
}
