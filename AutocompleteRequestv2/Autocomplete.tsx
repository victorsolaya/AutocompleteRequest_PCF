import * as React from "react";
import {useRef, useState, useEffect} from 'react';
import { Stack, IconButton, IIconProps, TextField, DetailsList, DetailsListLayoutMode, Selection, SelectionMode, initializeIcons, Spinner, SpinnerSize } from '@fluentui/react/lib';
import { IAutocompleteProps } from './AutocompleteTypes'
import { textFieldStyles } from './Autocomplete.styles'
const clearIcon: IIconProps = { iconName: 'Clear' };


const Autocomplete = (props: IAutocompleteProps) => {
    let _selection: Selection = new Selection();
    let timeout: any = null;
    initializeIcons();
    const textRef: any = useRef(null);
    const [loading, setLoading] = useState(false);
    const [columns, setColumns] = useState(props.columns);
    const [allItems, setAllItems] = useState([]);
    const [textFieldValue, setTextFieldValue] = useState(props.inputValue || "");
    const [userInput, setUserInput] = useState("");
    
    useEffect(() => {
        _selection = new Selection({
            onSelectionChanged: () => { _getSelectionDetails() }
        });
    }, [])
   

    /**
     * Everytime is triggered the onKeyUp it will trigger this functionality
     */
    const userInputOnChange = async (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>): Promise<any> => {
        // Get the target
        //Set the value of our textfield to the input
        clearTimeout(timeout);
        setTimeout(async () => {
            let textRefValue = textRef.current?.value;
            setTextFieldValue(textRefValue);
            //This is needed for loading the textFieldValue
            setLoading(true);
            //Build the url as we want
            
            // Await for the fetchRequest to response
            try{
                const listOfItems: any = await fetchRequestUrl(textRefValue)
                //const listOfItems: any = await this.fetchRequestUrlTesting()
                
                //Set the state of the user input as well the _allItems to be populated with the first 1 so the list is not huge
                const userInputValue = props.userInput || "";
                setUserInput(userInputValue);
                setAllItems(getFirstItems(listOfItems,10));
            }catch(error) {
                console.log(error);
            }
            finally {
                setLoading(false)
            }
        }, 1000);
    };
        

    //Fetch URL from the build
    const fetchRequestUrl = async (userInput: string): Promise<any> => {
        let requestJson = await runAction(userInput);
        return requestJson;
    }


    const runAction = (userInput: any) => {
        var parameters = {} as any;
        parameters.inputString = userInput;
        parameters.isPredictive = true;
        
        var actionToBeSent: any = {
            action: parameters.action,
            getMetadata: function() {
                return {
                    boundParameter: "entity",
                    parameterTypes: {​​​​​
                        "entity": {​​​​​
                            typeName: "mscrm." + props.entityRecordName,
                            structuralProperty: 5
                        }​​​​​,
                        "inputString": {​​​​​
                            "typeName": "Edm.String",
                            "structuralProperty": 1
                        }​​​​​,
                        "isPredictive": {
                            "typeName": "Edm.Boolean",
                            "structuralProperty": 1
                        },
                    }​​​​​,
                    operationType: 0,
                    operationName: this.props.actionName
                };
            }
        };
        
        return Xrm.WebApi.online.execute(actionToBeSent).then(
            function success(result) {
                if (result.ok) {
                    return result.json();
                }
            },
            function(error) {
                console.log(error)
            }
        );
    }​​

    const clearTextField = (): void => {

        setAllItems([]);
        setTextFieldValue("");
        setUserInput("");
        textRef.current.value = "";
    }

    const getFirstItems = (listOfItems: any, numberOfItems: number): [] => {
        return Array.isArray(listOfItems) == true ? listOfItems.slice(0, numberOfItems) : [listOfItems];
    }

    const _getSelectionDetails = (): void => {

        const listSelection: any = _selection.getSelection();
        const dataSet = props.dataToBeSet.split(';');

        let valueToBeAssigned: any = parseJSONToData(dataSet, listSelection[0]);
    
        setAllItems([]);
        setTextFieldValue(valueToBeAssigned);
        if (valueToBeAssigned != "") {
            //this.props.userInputChanged(valueToBeAssigned);
            _selection.setAllSelected(false)
        }

    }

    const parseJSONToData =(dataSetArray: any,json: any) => {
        let valueToBeAssigned: any = json;
        dataSetArray.forEach(function(d:any) {
            valueToBeAssigned = valueToBeAssigned[d]
        })
        return valueToBeAssigned;
    }

    let detailsList, spinner;
    let textField = props.isControlVisible ?
        <Stack style={{ flexDirection: 'row' }}>
            <TextField
                placeholder="---"
                onChange={userInputOnChange}
                autoComplete="off"
                styles={textFieldStyles}
                disabled={props.isControlDisabled}
                componentRef={textRef}
            />
            <IconButton iconProps={clearIcon} title="Clear" ariaLabel="Clear" onClick={clearTextField} />
        </Stack>
        : "";
    /**
     * If _allItems is more than 0 then we will create the list.
     * _allItems will populate once it request from fetch
     */
    if (loading) {
        spinner = <Spinner size={SpinnerSize.medium} styles={{
            root: { margin: 10 }
        }} />
    }
    if (allItems.length > 0) {
        detailsList =
            <Stack><DetailsList
                isHeaderVisible={props.headerVisible}
                items={allItems}
                columns={columns}
                setKey="set"
                selection={_selection}
                selectionMode={SelectionMode.single}
                layoutMode={DetailsListLayoutMode.justified}
                selectionPreservedOnEmptyClick={false}
                ariaLabelForSelectionColumn="Toggle selection"
                checkButtonAriaLabel="Checkbox"
                styles={{
                    root: {
                        flex: 1,
                        position: 'absolute',
                        zIndex: 1995,
                        boxShadow: "rgba(0, 0, 0, 0.133) 0px 3.2px 7.2px 0px, rgba(0, 0, 0, 0.11) 0px 0.6px 1.8px 0px"
                    }
                }}
            /></Stack>
    } else {
        detailsList = ""
    }
    
    return (
        <div className={"divContainer"}>
            <div className={"control"} >
                {textField}
                {spinner}
                {detailsList}
            </div>
        </div>
    );

    
}

export default Autocomplete;