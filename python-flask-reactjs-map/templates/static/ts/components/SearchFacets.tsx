import React, { PureComponent } from "react";

import { MultiSelect } from 'primereact/multiselect';
import { NamedOperator } from '../facetinfo';

export class SearchFacetsProps {
    
    allVisibleOperators: NamedOperator[];
    onOperatorSelected: (operators: NamedOperator[]) => void;
}

class SearchFacetsState {

    selectedOperators: NamedOperator[];
}

export class SearchFacets extends PureComponent<SearchFacetsProps, SearchFacetsState> {

    constructor(props: SearchFacetsProps) {
        super(props);

        this.state = {
            selectedOperators: []
        }
        
        this._onOperatorSelected = this._onOperatorSelected.bind(this);
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
            </div>;
    }
    
    private _onOperatorSelected(operators: NamedOperator[]) {

        this.setState(state => ({...state, selectedOperators: operators }));

        this.props.onOperatorSelected(operators);
    }
}
