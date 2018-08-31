import { style } from 'typestyle';
import SharedStyles from './shared-styles';

export namespace TagListStyleClasses {
  export const selectedTagStyleClass = style(SharedStyles.tagStyleProperties, {
    color: 'white',
    backgroundColor: '#2196F3',
    outline: 'none'
  });

  export const unselectedTagStyleClass = style(
    SharedStyles.tagStyleProperties,
    {
      backgroundColor: 'var(--jp-layout-color2)',
      outline: 'none'
    }
  );

  export const editTagStyleClass = style(SharedStyles.tagStyleProperties, {
    backgroundColor: 'var(--jp-layout-color1)',
    border: '1px solid #2196F3',
    maxWidth: '95%',
    minHeight: '31px',
    maxHeight: '31px',
    outline: 'none'
  });

  export const tagSubHeaderStyleClass = style({
    paddingLeft: '10px',
    marginBottom: '3px'
  });

  export const tagHolderStyleClass = style({
    display: 'flex',
    flexWrap: 'wrap',
    padding: '4px',
    marginLeft: '0',
    paddingLeft: '7px',
    height: 'fit-content',
    marginBottom: '11px',
    paddingRight: '10px'
  });
}
