export interface IColumnObject {
    key: string,
    name: string,
    fieldName: string,
    minWidth: number,
    maxWidth?: number,
    isResizable: boolean
  }
  
  export interface IAutocompleteProps {
    userInput?: string;
    userInputChanged: (newValue: string) => void,
    widthColumn: number,
    columns: [IColumnObject],
    inputValue?: string,
    dataToBeSet: string,
    headerVisible: boolean,
    isControlVisible: boolean,
    isControlDisabled: boolean,
    actionName: string,
    entityRecordName: string
  }