import {
  TagsWidget
} from './tagswidget';

import * as React from 'react';
import StyleClasses from './styles';

const TagStyleClasses = StyleClasses.TagStyleClasses;

export
abstract class TagComponent extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
    this.state = {addingNewTag: false};
  }

  abstract singleCellOperationHandler(name: string): void;
  abstract singleCellOperationButton(name: string, operation: (event: React.MouseEvent<any>) => void): JSX.Element;

  render() {
    const inputShouldShow = this.props.inputShouldShow as boolean;
    const tag = this.props.tag as string;
    return (
      <div>
        <label className={ TagStyleClasses.tagLabelStyleClass }
          ref={ (label) => inputShouldShow && label && label.focus() }
          contentEditable={ inputShouldShow } 
          key={ new Date().toLocaleTimeString() }
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
            this.props.editingStateHandler(false);
          } }
        >
          { tag }
        </label>
        <label className={ TagStyleClasses.tagIconLabelStyleClass }>
          { this.singleCellOperationButton(tag, (
            (event: React.MouseEvent<any>) => {
              event.stopPropagation();
              this.singleCellOperationHandler(tag); 
            }
          )) }
        </label>
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
      return <img onClick={ (event) => operation(event) } 
               alt="Add Tag To Active Cell" 
               src={ require("../../static/white_addcircle.svg") } 
               className={ TagStyleClasses.tagIconStyleClass }
             />;
    } else {
      return <img onClick={ (event) => operation(event) } 
               alt="Add Tag To Active Cell"                
               src={ require("../../static/darkgrey_addcircle.svg") }
               className={ TagStyleClasses.tagIconStyleClass }
             />;
    }
  }

}

export
class TagForAllCellsComponent extends TagComponent {

  singleCellOperationHandler(name: string) {
    this.props.selectionStateHandler(null);
    if (name !== null) {
      (this.props.widget as TagsWidget).removeTagForSelectedCellWithName(name);
    }
  }

  singleCellOperationButton(name: string, operation: (event: React.MouseEvent<any>) => void) {
    if (this.props.selectedTag as string === name) {
      return <img onClick={ (event) => operation(event) } 
               alt="Remove Tag From Active Cell"
               src={ require("../../static/white_minuscircle.svg") } 
               className={ TagStyleClasses.tagIconStyleClass }
             />;
    } else {
      return <img onClick={ (event) => operation(event) } 
               alt="Remove Tag From Active Cell"
               src={require("../../static/darkgrey_minuscircle.svg")}
               className={ TagStyleClasses.tagIconStyleClass }
             />;
    }
  }

}

export
class AddTagComponent extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
    this.state = { plusIconShouldHide: false,addingNewTag:false };
  }

  finishedAddingTag(name: string) {
    (this.props.widget as TagsWidget).didFinishAddingTags(name);
  }

  addTagOnClick(event: React.MouseEvent<HTMLInputElement>) {
    this.setState({ plusIconShouldHide: true,addingNewTag:true });
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
    tmp.className = TagStyleClasses.defaultAddInputStyleClass;
    tmp.innerHTML = inputElement.value;
    document.body.appendChild(tmp);
    inputElement.style.width = (tmp.getBoundingClientRect().width + 8) + "px";
    document.body.removeChild(tmp);
    if (event.keyCode == 13) {
      let value = inputElement.value;
      inputElement.value = '';
      this.finishedAddingTag(value);
      inputElement.value = 'Add Tag';
      inputElement.style.width = '50px';
      inputElement.style.minWidth = '50px';
      inputElement.blur();
      this.setState({ plusIconShouldHide: false, addingNewTag:false});
    }
  }

  addTagOnBlur(event:React.FocusEvent<HTMLInputElement>) {
    let inputElement = event.target as HTMLInputElement;
    inputElement.value = 'Add Tag';
    inputElement.style.width = '50px';
    inputElement.style.minWidth = '50px';
    inputElement.blur();
    this.setState({ plusIconShouldHide: false, addingNewTag:false });
  }

  render() {
    var inputBox = (this.state.addingNewTag === true) 
                 ? (<div>
                      <input className={ TagStyleClasses.defaultAddInputStyleClass }
                        onClick={ (event) => this.addTagOnClick(event) }
                        onKeyDown={ (event) => this.addTagOnKeyDown(event) }
                        onBlur = { (event) => this.addTagOnBlur(event) } autoFocus
                      />
                    </div>)
                 : (<div className={ TagStyleClasses.blankAddInputStyleClass }
                     onClick={(event) => this.setState({ addingNewTag: true })}
                    >
                      Add Tag
                      <img src={ require("../../static/add_icon.svg") } 
                        className={ TagStyleClasses.inputIconStyleClass } 
                        onClick={ (event) => 
                          this.setState({ addingNewTag:true })
                        }
                     />
                    </div>);
    return (
      <div className={ TagStyleClasses.addTagStyleClass } >
        {inputBox}
      </div>
    );
  }

}
