import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import  Autocomplete  from './Autocomplete';
import { IColumnObject, IAutocompleteProps } from './AutocompleteTypes'
export class AutocompleteRequestv2 implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	// Reference to ComponentFramework Context object
	private _context: ComponentFramework.Context<IInputs>;
	// reference to the notifyOutputChanged method
	private _notifyOutputChanged: () => void;
	// reference to the container div
	private _container: HTMLDivElement;
	/**
	 * Empty constructor.
	 */
	constructor() { }

	// Value of the field is stored and used inside the control 
	private props: IAutocompleteProps = {
		userInputChanged: this.userInputChanged.bind(this),
		widthColumn: 300,
		columns: [{key: "",isResizable: true, fieldName: "", minWidth: 0, name: "", maxWidth: 0}],
		inputValue: "",
		dataToBeSet: "",
		isControlDisabled: false,
		isControlVisible: false,
		headerVisible: true,
		actionName: "",
		entityRecordName: ""
	}

	private _value: string;

	

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(
		context: ComponentFramework.Context<IInputs>,
		notifyOutputChanged: () => void,
		state: ComponentFramework.Dictionary,
		container: HTMLDivElement) {
debugger
		this._context = context;
		this._container = container;
		this._notifyOutputChanged = notifyOutputChanged;

		if (this._context.parameters.field != null && this._context.parameters.field.raw != "") {
			this.props.inputValue = this._context.parameters.field.raw || "";
		}
		this.props.dataToBeSet = this._context.parameters.data.raw || "";
		this.props.actionName = this._context.parameters.actionName.raw || "";
		this.props.widthColumn = this._context.parameters.widthColumn.raw || 300;
		const columns: string = this._context.parameters.columns.raw?.trim() || "Name,Name";
		this.props.columns = this.parseColumns(columns);
		const contextPage = (this._context as any).page;
		const entityRecordId = contextPage.entityId;
		const entityRecordName = contextPage.entityTypeName;
		this.props.entityRecordName = entityRecordName;
	}

	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public async updateView(context: ComponentFramework.Context<IInputs>): Promise<void> {
		// Add code to update control view
		this.props.isControlDisabled = context.mode.isControlDisabled;
		this.props.isControlVisible = context.mode.isVisible;

		ReactDOM.render(
			React.createElement(
				Autocomplete,
				this.props
			)
			,
			this._container
		);
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs {
		return {
			field: this._value
		};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void {
		// Add code to cleanup control if necessary
		ReactDOM.unmountComponentAtNode(this._container);
	}

	private runAction(data: any) {
		const contextPage = (this._context as any).page;
		const entityRecordId = contextPage.entityId;
		const entityRecordName = contextPage.entityTypeName;

		var target = {​​​​​} as any​​​​​;
	    target.entityType = entityRecordName;
	    target.id = entityRecordId;

	    var req = {​​​​​}​​​​​ as any;
	    req.entity = target;

        req.inputString = data;
		req.isPredictive = false;
        req.getMetadata = function () {​​​​​
            return {​​​​​
               boundParameter: "entity",
                parameterTypes: {​​​​​
                    "entity": {​​​​​
                        typeName: "mscrm." + entityRecordName,
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
            }​​​​​;
        }​​​​​;
		Xrm.WebApi.online.execute(req)
			.then(function(result : any) {
				if (result.ok) {
					console.log("Everything went ok")
				}else{
					console.log("There was an error");
				}
			}, function(error: any) {
				console.log(error)
			})
    }​​

	private userInputChanged(newValue: string) {
		if (this.props.userInput !== newValue) {
			this._value = newValue;
			this._notifyOutputChanged();
			this.runAction(newValue);
		}
	}

	private parseColumns = (columns: string): [IColumnObject] => {
		let parsedColumns: any = [];
		const arrayColumns = columns.split(';');
		var index = 1;

		arrayColumns.forEach(column => {
			var newColumn: IColumnObject = {} as IColumnObject;
			var splitColumn = column.split(',');
			const displayName = splitColumn[0].trim();
			const fieldName = splitColumn[1].trim();
			newColumn.fieldName = fieldName;
			newColumn.name = displayName;
			newColumn.isResizable = true;
			newColumn.key = "column" + index;
			newColumn.minWidth = this.props.widthColumn;
			newColumn.maxWidth;
			index++;
			parsedColumns.push(newColumn);
		});

		return parsedColumns;
	}

}