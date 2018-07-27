import { TagsWidget } from './tagswidget';

import * as React from 'react';
import StyleClasses from './styles';
import { EditingStates } from './tagstool';

const TagStyleClasses = StyleClasses.TagStyleClasses;

// TODO: Declare TagComponentProps
export interface TagComponentProps {
  singleCellOperationHandler: (name: string) => void;
  singleCellOperationButton: (
    name: string,
    operation: (event: React.MouseEvent<any>) => void
  ) => JSX.Element;
  inputShouldShow?: any;
  tag?: any;
  finishEditingHandler?: any;
  editingStateHandler?: any;
  widget: any;
  selectedTag: any;
  editingSelectedTag: any;
  selectionStateHandler: any;
  deletingStateHandler: any;
  allTagsList: any;
  tagsList: any;
}

export class TagComponent extends React.Component<any> {
  render() {
    const inputShouldShow = this.props.inputShouldShow as boolean;
    const tag = this.props.tag as string;
    return (
      <div>
        <label
          className={TagStyleClasses.tagLabelStyleClass}
          ref={label => inputShouldShow && label && label.focus()}
          contentEditable={inputShouldShow}
          suppressContentEditableWarning={true}
          key={new Date().toLocaleTimeString()}
          onFocus={event => document.execCommand('selectAll', false, null)}
          onKeyDown={event => {
            if (event.keyCode == 13) {
              let value = (event.target as HTMLLabelElement).innerHTML;
              this.props.finishEditingHandler(value);
            }
          }}
          onBlur={event => {
            let inputElement = event.target as HTMLLabelElement;
            inputElement.innerHTML = tag;
            this.props.editingStateHandler(EditingStates.none);
          }}
        >
          {tag}
        </label>
        <label className={TagStyleClasses.tagIconLabelStyleClass}>
          {this.props.singleCellOperationButton(
            tag,
            (event: React.MouseEvent<any>) => {
              event.stopPropagation();
              this.props.singleCellOperationHandler(tag);
            }
          )}
        </label>
      </div>
    );
  }
}

// TODO: Declare TagForAllCellsComponentProps
export interface TagForAllCellsComponentProps {
  widget: any;
  selectedTag: any;
}

export class TagForAllCellsComponent extends React.Component<any> {
  singleCellOperationHandler = (name: string) => {
    (this.props.widget as TagsWidget).addTagToActiveCell(name);
  };

  singleCellOperationButton = (
    name: string,
    operation: (event: React.MouseEvent<any>) => void
  ) => {
    if ((this.props.selectedTag as string) === name) {
      return (
        <img
          onClick={event => operation(event)}
          alt="Add Tag To Active Cell"
          title="Add Tag To Active Cell"
          src={require('../../static/white_addcircle.svg')}
          className={TagStyleClasses.tagIconStyleClass}
        />
      );
    } else {
      return (
        <img
          onClick={event => operation(event)}
          alt="Add Tag To Active Cell"
          title="Add Tag To Active Cell"
          src={require('../../static/darkgrey_addcircle.svg')}
          className={TagStyleClasses.tagIconStyleClass}
        />
      );
    }
  };

  render() {
    return (
      <TagComponent
        singleCellOperationHandler={this.singleCellOperationHandler}
        singleCellOperationButton={this.singleCellOperationButton}
      />
    );
  }
}

// TODO: Declare TagForActiveCellComponentProps
export interface TagForActiveCellComponentProps {
  selectionStateHandler: any;
  widget: any;
  selectedTag: any;
}

export class TagForActiveCellComponent extends React.Component<any> {
  singleCellOperationHandler = (name: string) => {
    this.props.selectionStateHandler(null);
    if (name !== null) {
      (this.props.widget as TagsWidget).removeTagForSelectedCellWithName(name);
    }
  };

  singleCellOperationButton = (
    name: string,
    operation: (event: React.MouseEvent<any>) => void
  ) => {
    if ((this.props.selectedTag as string) === name) {
      return (
        <img
          onClick={event => operation(event)}
          alt="Remove Tag From Active Cell"
          title="Remove Tag From Active Cell"
          src={require('../../static/white_minuscircle.svg')}
          className={TagStyleClasses.tagIconStyleClass}
        />
      );
    } else {
      return (
        <img
          onClick={event => operation(event)}
          alt="Remove Tag From Active Cell"
          title="Remove Tag From Active Cell"
          src={require('../../static/darkgrey_minuscircle.svg')}
          className={TagStyleClasses.tagIconStyleClass}
        />
      );
    }
  };

  render() {
    return (
      <TagComponent
        singleCellOperationHandler={this.singleCellOperationHandler}
        singleCellOperationButton={this.singleCellOperationButton}
      />
    );
  }
}

// TODO: Declare TagForActiveCellComponentProps
export interface AddTagComponentProps {
  widget: any;
}

// TODO: Declare AddTagComponentState
export interface AddTagComponentState {
  plusIconShouldHide: boolean;
  addingNewTag: boolean;
  inputValue: string;
}

export class AddTagComponent extends React.Component<any, any> {
  state = {
    plusIconShouldHide: false,
    addingNewTag: false,
    inputValue: 'Add Tag'
  };

  finishedAddingTag = (name: string) => {
    (this.props.widget as TagsWidget).didFinishAddingTags(name);
  };

  addTagOnClick = (event: React.MouseEvent<HTMLInputElement>) => {
    this.setState({
      inputValue:
        this.state.inputValue === 'Add Tag' ? '' : this.state.inputValue,
      plusIconShouldHide: true,
      addingNewTag: true
    });
  };

  addTagOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    this.inputElement.style.width =
      this.inputElement.getBoundingClientRect().width + 8 + 'px';
    if (event.keyCode == 13) {
      this.finishedAddingTag(this.state.inputValue);
      this.setState({
        inputValue: 'Add Tag',
        plusIconShouldHide: false,
        addingNewTag: false
      });
      this.inputElement.blur();
    }
  };

  addTagOnBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    this.setState({
      inputValue: 'Add Tag',
      plusIconShouldHide: false,
      addingNewTag: false
    });
    this.inputElement.blur();
  };

  render() {
    const inputBox =
      this.state.addingNewTag === true ? (
        <div>
          <input
            ref={ref => {
              this.inputElement = ref;
            }}
            className={TagStyleClasses.defaultAddInputStyleClass}
            onClick={this.addTagOnClick}
            onKeyDown={this.addTagOnKeyDown}
            onBlur={this.addTagOnBlur}
            autoFocus
            value={this.state.inputValue}
            style={{
              width: this.state.inputValue === 'Add Tag' ? 62 : 50,
              minWidth: this.state.inputValue === 'Add Tag' ? 62 : 50,
              height: this.state.inputValue === 'Add Tag' ? 62 : 50
            }}
          />
        </div>
      ) : (
        <div
          className={TagStyleClasses.blankAddInputStyleClass}
          onClick={event => this.setState({ addingNewTag: true })}
        >
          Add Tag
          <img
            src={require('../../static/add_icon.svg')}
            className={TagStyleClasses.inputIconStyleClass}
            onClick={event => this.setState({ addingNewTag: true })}
          />
        </div>
      );
    return <div className={TagStyleClasses.addTagStyleClass}>{inputBox}</div>;
  }

  private inputElement: HTMLInputElement = null;
}
