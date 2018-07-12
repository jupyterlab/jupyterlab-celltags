import {
  TagComponent, 
  TagForActiveCellComponent, 
  TagForAllCellsComponent, 
  AddTagComponent
} from './tag';

import {
  TagsWidget
} from './tagswidget';

import * as React from 'react';

const TAG_LABEL_DIV_CLASS = 'jp-cellTags-unselected-tag';
const TAG_SELECTED_LABEL_DIV_CLASS = 'jp-cellTags-selected-tag';

export
class TagListComponent extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
    this.didfinishEditingTagName = this.didfinishEditingTagName.bind(this);
    this.state = { selected: this.props.selectedTag };
  }

  didSelectTagWithName(name: string) {
    if ((!(this.props.editingSelectedTag)) 
      || (this.props.selectedTag != name)) {
      this.props.selectionStateHandler(name);
      this.props.editingStateHandler(false);
    }
    if (this.props.selectedTag === name 
      && (!(this.props.editingSelectedTag as boolean))) {
      this.props.selectionStateHandler(null);
      this.props.editingStateHandler(false);
    }
    this.props.deletingStateHandler(false);
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
      const tagClass = (selectedTag === tag) 
                     ? TAG_SELECTED_LABEL_DIV_CLASS 
                     : TAG_LABEL_DIV_CLASS;
      const inputShouldShow = (selectedTag === tag) 
                             && (this.props.editingSelectedTag as boolean);
      return (
        <div key={ tag } 
          className={ tagClass } 
          onClick={ (event) => this.didSelectTagWithName(tag) }
        >
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