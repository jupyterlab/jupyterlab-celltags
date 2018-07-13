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
import StyleClasses from './styles';

const TagListStyleClasses = StyleClasses.TagListStyleClasses;

export
class TagListComponent extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
    this.editedTagName = this.editedTagName.bind(this);
    this.state = { selected: this.props.selectedTag };
  }

  selectedTagWithName(name: string) {
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

  editedTagName(newName: string) {
    let widget = (this.props.widget as TagsWidget);
    this.props.editingStateHandler(false);
    widget.replaceName(this.props.selectedTag, newName);
    this.props.selectionStateHandler(null);
  }

  tagInActiveCell(name: string) {
    return (this.props.widget as TagsWidget).activeCellContainsTag(name);
  }

  renderElementForTags(tags: string[], TagType: typeof TagComponent) {
    const selectedTag = this.props.selectedTag;
    return tags.map((tag, index) => {
      const tagClass = (selectedTag === tag) 
                     ? TagListStyleClasses.selectedTagStyleClass
                     : TagListStyleClasses.unselectedTagStyleClass;
      const inputShouldShow = (selectedTag === tag) 
                             && (this.props.editingSelectedTag as boolean);
      return (
        <div key={ tag } 
          className={ tagClass } 
          onClick={ (event) => this.selectedTagWithName(tag) }
        >
          <TagType widget={ this.props.widget }
            finishEditingHandler={ this.editedTagName } 
            selectionStateHandler={ this.props.selectionStateHandler }
            editingStateHandler={ this.props.editingStateHandler }
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
        if (!this.tagInActiveCell(allTagsList[i])) {
          otherTagsList.push(allTagsList[i])
        }
      }
    }
    var renderedTagsForActiveCell = null;
    if (otherTagsList != null) {
      renderedTagsForActiveCell = this.renderElementForTags(otherTagsList, 
                                                    TagForActiveCellComponent);
    }
    var renderedTagsForAllCells = null;
    if (this.props.tagsList != null) {
      let tags = (this.props.tagsList as string).toString().split(',');
      renderedTagsForAllCells = this.renderElementForTags(tags, 
                                              TagForAllCellsComponent);
    }
    return (
      <div>
        <div className={ TagListStyleClasses.tagSubHeaderStyleClass }>
          Tags in Active Cell
        </div>
        <div className={ TagListStyleClasses.tagHolderStyleClass }>
          { renderedTagsForAllCells }
          <AddTagComponent widget={ this.props.widget } />
        </div>
        <div className={ TagListStyleClasses.tagSubHeaderStyleClass }>
          Other Tags in Notebook
        </div>
        <div>
          <div className={ TagListStyleClasses.tagHolderStyleClass }>
          { renderedTagsForActiveCell }
          </div>
        </div>
      </div>
    );
  }

}