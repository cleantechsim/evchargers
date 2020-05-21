import React, { PureComponent } from "react";

import { MultiSelect } from 'primereact/multiselect';
import { Slider } from 'primereact/slider';
import { NamedOperator } from '../facetinfo';
import { Range } from "../range";

import './SearchFacets.css';

export class SearchFacetsProps {
    
    allVisibleOperators: NamedOperator[];

    kwMinMax: Range;

    onOperatorSelected: (operators: NamedOperator[]) => void;
    onKwRangeSelected: (kwRange: Range) => void;
}

class SearchFacetsState {

    selectedOperators: NamedOperator[];
    
    kwLoValue: number;
    kwHiValue: number;
}

export class SearchFacets extends PureComponent<SearchFacetsProps, SearchFacetsState> {

    constructor(props: SearchFacetsProps) {
        super(props);

        this.state = {
            selectedOperators: [],
            kwLoValue: this.props.kwMinMax.min,
            kwHiValue: this.props.kwMinMax.max
        }
        
        this._onOperatorSelected = this._onOperatorSelected.bind(this);
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

        let updatedSelectedOperators: NamedOperator[] = [];

        for (let selected of this.state.selectedOperators) {
            
            for (let operator of this.props.allVisibleOperators) {
                if (operator.id === selected.id) {
                    updatedSelectedOperators.push(operator);
                    break;
                }
            }
        }

        let placeHolder = "Operators"; // [" + this.props.allVisibleOperators.length + " with " + count + " charge points]";
    
        return <div>
                <MultiSelect
                    optionLabel = "name"
                    placeholder = {placeHolder}
                    value = { updatedSelectedOperators }
                    options = { this.props.allVisibleOperators }
                    onChange = {(e) => {                        
                        this._onOperatorSelected(e.value);
                }}/>

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
    
    private _onOperatorSelected(operators: NamedOperator[]) {

        this.setState(state => ({...state, selectedOperators: operators }));

        this.props.onOperatorSelected(operators);
    }

    private _onKwRangeChanged(values: any) {

        this.setState(state => ({...state, kwLoValue: values[0], kwHiValue: values[1]}))
    }

    private _onKwRangeSelected(values: any) {

        this.props.onKwRangeSelected(new Range(this.state.kwLoValue, this.state.kwHiValue))
    }
}
