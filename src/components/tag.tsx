import {
  TagsWidget
} from './tagswidget';

import * as React from 'react';

const TAG_ADD_DIV = 'jp-cellTags-tag-add';
const TAG_INPUT = 'jp-cellTags-tag-input';
const TAG_LABEL = 'jp-cellTags-tag-label';

export
abstract class TagComponent extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
  }

  abstract singleCellOperationHandler(name: string): void;
  abstract singleCellOperationButton(name: string, operation: (event: React.MouseEvent<any>) => void): JSX.Element;

  render() {
    const inputShouldShow = this.props.inputShouldShow as boolean;
    const tag = this.props.tag as string;
    return (
      <div>
        <label className={ TAG_LABEL }
          ref={ (label) => inputShouldShow && label && label.focus() }
          contentEditable={ inputShouldShow } 
          onFocus={ (event) => document.execCommand('selectAll', false, null) }
          onKeyDown={ (event) => {
            if (event.keyCode == 13) {
              let value = (event.target as HTMLLabelElement).innerHTML;
              this.props.finishEditingHandler(value);
            }
          } }
          onBlur={ (event) => {
            let inputElement = event.target as HTMLLabelElement;
            inputElement.innerHTML = tag;
            this.setState({ editingSelectedTag: false });
          } }
        >{ tag }</label>
        <label>{ this.singleCellOperationButton(tag, ((event: React.MouseEvent<any>) => {
          event.stopPropagation();
          this.singleCellOperationHandler(tag); 
        })) }</label>
      </div>
    )
  }

}

export
class TagForActiveCellComponent extends TagComponent {

  singleCellOperationHandler(name: string) {
    (this.props.widget as TagsWidget).addTagToActiveCell(name);
  }

  singleCellOperationButton(name: string, operation: (event: React.MouseEvent<any>) => void) {
    if (this.props.selectedTag as string === name) {
      return <img onClick={ (event) => operation(event) } src={ require("../../static/white_addcircle.svg") } className="tag-icon"/>;
    } else {
      return <img onClick={ (event) => operation(event) } src={ require("../../static/darkgrey_addcircle.svg") } className="tag-icon"/>;
    }
  }

}

export
class TagForAllCellsComponent extends TagComponent {

  singleCellOperationHandler(name: string) {
    // TODO: set state to null
    if (name !== null) {
      (this.props.widget as TagsWidget).removeTagForSelectedCellWithName(name);
    }
  }

  singleCellOperationButton(name: string, operation: (event: React.MouseEvent<any>) => void) {
    if (this.props.selectedTag as string === name) {
      return <img onClick={ (event) => operation(event) } src={ require("../../static/white_minuscircle.svg") } className="tag-icon" />;
    } else {
      return <img onClick={ (event) => operation(event) } src={require("../../static/darkgrey_minuscircle.svg")} className="tag-icon"/>;
    }
  }

}

export
class AddTagComponent extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
    this.state = { plusIconShouldHide: false };
  }

  didFinishAddingTagWithName(name: string) {
    (this.props.widget as TagsWidget).didFinishAddingTags(name);
  }

  addTagOnClick(event: React.MouseEvent<HTMLInputElement>) {
    this.setState({ plusIconShouldHide: true });
    let inputElement = event.target as HTMLInputElement;
    if (inputElement.value === 'Add Tag') {
      inputElement.value = '';
      inputElement.style.width = '62px';
      inputElement.style.minWidth = '62px';
    }
  }

  addTagOnKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    let inputElement = event.target as HTMLInputElement;
    let tmp = document.createElement('span');
    tmp.className = TAG_INPUT;
    tmp.innerHTML = inputElement.value;
    document.body.appendChild(tmp);
    inputElement.style.width = (tmp.getBoundingClientRect().width + 8) + "px";
    document.body.removeChild(tmp);
    if (event.keyCode == 13) {
      let value = inputElement.value;
      inputElement.value = '';
      this.didFinishAddingTagWithName(value);
      inputElement.value = 'Add Tag';
      inputElement.style.width = '50px';
      inputElement.style.minWidth = '50px';
      inputElement.blur();
      this.setState({ plusIconShouldHide: false });
    }
  }

  addTagOnBlur(event:React.FocusEvent<HTMLInputElement>) {
    let inputElement = event.target as HTMLInputElement;
    inputElement.value = 'Add Tag';
    inputElement.style.width = '50px';
    inputElement.style.minWidth = '50px';
    inputElement.blur();
    this.setState({ plusIconShouldHide: false });
  }

  render() {
    return (
      <div className={ TAG_ADD_DIV } >
        <input className={ TAG_INPUT }
          defaultValue='Add Tag'
          onClick={(event) => this.addTagOnClick(event)}
          onKeyDown={ (event) => this.addTagOnKeyDown(event)}
          onBlur = { (event) => this.addTagOnBlur(event)} 
        />
        <label className={"add-tag-box"} hidden={ this.state.plusIconShouldHide }>  +</label>
      </div>
    );
  }

}