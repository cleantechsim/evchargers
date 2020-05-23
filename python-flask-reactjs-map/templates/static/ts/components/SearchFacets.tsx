import React, { PureComponent } from "react";

import { MultiSelect } from 'primereact/multiselect';
import { Slider } from 'primereact/slider';
import { NamedOperator, NamedConnectionType } from '../facetinfo';
import { Range } from "../range";

import './SearchFacets.css';
import { ConnectionType } from "../dtos/clusterssresult";

export class SearchFacetsProps {
    
    allVisibleOperators: NamedOperator[];
    allVisibleConnectionTypes: NamedConnectionType[];

    kwMinMax: Range;

    onOperatorSelected: (operators: NamedOperator[]) => void;
    onConnectionTypeSelected: (connectionTypes: ConnectionType[]) => void;
    onKwRangeSelected: (kwRange: Range) => void;
}

class SearchFacetsState {

    selectedOperators: NamedOperator[];

    selectedConnectionTypes: NamedConnectionType[];
    
    kwLoValue: number;
    kwHiValue: number;
}

export class SearchFacets extends PureComponent<SearchFacetsProps, SearchFacetsState> {

    constructor(props: SearchFacetsProps) {
        super(props);

        this.state = {
            selectedOperators: [],
            selectedConnectionTypes: [],
            kwLoValue: this.props.kwMinMax.min,
            kwHiValue: this.props.kwMinMax.max
        }
        
        this._onOperatorSelected = this._onOperatorSelected.bind(this);
        this._onConnectionTypeSelected = this._onConnectionTypeSelected.bind(this);
        this._onKwRangeChanged = this._onKwRangeChanged.bind(this);
        this._onKwRangeSelected = this._onKwRangeSelected.bind(this);
    }
    
    componentDidUpdate(prevProps: SearchFacetsProps) {

        // Update value in slider if outside of min/max returned from ES
        let minVal: number = this.state.kwLoValue;
        let maxVal: number = this.state.kwHiValue;
        
        if (minVal < this.props.kwMinMax.min) {
            minVal = this.props.kwMinMax.min;
        }

        if (maxVal > this.props.kwMinMax.max) {
            maxVal = this.props.kwMinMax.max;
        }
        
        // Updated?
        if (minVal !== this.state.kwLoValue || maxVal !== this.state.kwHiValue) {
            this.setState(state => ({...state, kwLoValue: minVal, kwHiValue: maxVal }));
        }
    }
    
    render() {
        
        let count = 0;  
    
        for (let op of this.props.allVisibleOperators) {
            
            count += op.count;
        }

        const updatedSelectedOperators: NamedOperator[] = SearchFacets._findUpdated(
            this.state.selectedOperators,
            this.props.allVisibleOperators,
            (entry: NamedOperator, other: NamedOperator) => entry.id === other.id);

        
        const updatedSelectedConnectionTypes: NamedConnectionType[] = SearchFacets._findUpdated(
            this.state.selectedConnectionTypes,
            this.props.allVisibleConnectionTypes,
            (entry: NamedConnectionType, other: NamedConnectionType) => entry.id === other.id);


        let placeHolder = "Operators"; // [" + this.props.allVisibleOperators.length + " with " + count + " charge points]";
    
        return <div>
            
                <div id='search-facets-selects'>
                    <MultiSelect
                        id = "select-operators"
                        className = "select-options"
                        optionLabel = "name"
                        placeholder = {placeHolder}
                        value = { updatedSelectedOperators }
                        options = { this.props.allVisibleOperators }
                        maxSelectedLabels={0}
                        onChange = { e => { this._onOperatorSelected(e.value); } }/>

                    <MultiSelect
                        id = "select-connector-types"
                        className = "select-options"
                        optionLabel = "name"
                        placeholder = "Connectors"
                        value = { updatedSelectedConnectionTypes }
                        options = { this.props.allVisibleConnectionTypes }
                        maxSelectedLabels = {0}
                        onChange = { e => { this._onConnectionTypeSelected(e.value); } }
                    />
                </div>

                <div className="p-panel-content kw-range-values">
                    KW range ({this.state.kwLoValue} to {this.state.kwHiValue})
                    out of {this.props.kwMinMax.min} to {this.props.kwMinMax.max}
                </div>

                <Slider
                    value = {[this.state.kwLoValue, this.state.kwHiValue]}
                    min = {this.props.kwMinMax.min}
                    max = {this.props.kwMinMax.max}
                    step = {1}
                    range={true}
                    onChange={e => this._onKwRangeChanged(e.value) }
                    onSlideEnd={ e => this._onKwRangeSelected(e.value) }
                />
            </div>;
    }

    private static _findUpdated<T>(updated: T[], all: T[], compare: (entry: T, other: T) => boolean) : T[]{

        const result: T[] = [];

        for (let sel of updated) {
            
            for (let entry of all) {
                if (compare(entry, sel)) {
                    result.push(entry);
                    break;
                }
            }
        }

        return result;
    }
    
    private _onOperatorSelected(operators: NamedOperator[]) {

        this.setState(state => ({...state, selectedOperators: operators }));

        this.props.onOperatorSelected(operators);
    }

    private _onConnectionTypeSelected(connectionTypes: NamedConnectionType[]) {
        
        this.setState(state => ({...state, selectedConnectionTypes: connectionTypes}));
    
        this.props.onConnectionTypeSelected(connectionTypes);
    }

    private _onKwRangeChanged(values: any) {

        this.setState(state => ({...state, kwLoValue: values[0], kwHiValue: values[1]}))
    }

    private _onKwRangeSelected(values: any) {

        this.props.onKwRangeSelected(new Range(this.state.kwLoValue, this.state.kwHiValue))
    }
}
