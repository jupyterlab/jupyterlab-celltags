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

export class TagListComponent extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.editedTagName = this.editedTagName.bind(this);
    this.timer = null;
    this.state = { selected: this.props.selectedTag };
    this.selectedTagWithName = this.selectedTagWithName.bind(this);
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
    let widget = this.props.widget as TagsWidget;
    this.props.editingStateHandler(EditingStates.none);
    if (this.props.editingSelectedTag === EditingStates.allCells) {
      widget.replaceNameForAllCells(this.props.selectedTag, newName);
    } else if (this.props.editingSelectedTag === EditingStates.currentCell) {
      widget.replaceNameForActiveCell(this.props.selectedTag, newName);
    }
    this.props.selectionStateHandler(null);
  };

  tagInActiveCell = (name: string) => {
    return (this.props.widget as TagsWidget).activeCellContainsTag(name);
  };

  renderElementForTags = (
    tags: string[],
    TagType: typeof TagComponent,
    doubleClickAllowed: boolean
  ) => {
    const selectedTag = this.props.selectedTag;
    const _self = this;
    return tags.map((tag, index) => {
      const tagClass =
        selectedTag === tag
          ? TagListStyleClasses.selectedTagStyleClass
          : TagListStyleClasses.unselectedTagStyleClass;
      const inputShouldShow =
        selectedTag === tag &&
        this.props.editingSelectedTag != EditingStates.none;
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
              if (this.timer) {
                clearTimeout(this.timer);
              }
              this.timer = setTimeout(function() {
                _self.selectedTagWithName(tag);
              }, 250);
            }
          }}
          onDoubleClick={event => {
            clearTimeout(this.timer);
            if (
              this.props.editingSelectedTag === EditingStates.none &&
              doubleClickAllowed
            ) {
              this.props.selectionStateHandler(tag);
              this.props.editingStateHandler(EditingStates.currentCell);
            } else {
              if (!(this.props.selectedTag === tag)) {
                _self.selectedTagWithName(tag);
              }
            }
          }}
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
    let allTagsList = this.props.allTagsList as string[];
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
        TagForAllCellsComponent,
        false
      );
    }
    var renderedTagsForActiveCell = null;
    if (this.props.tagsList != null) {
      let tags = (this.props.tagsList as string).toString().split(',');
      renderedTagsForActiveCell = this.renderElementForTags(
        tags,
        TagForActiveCellComponent,
        true
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

  private timer: NodeJS.Timer = null;
}
