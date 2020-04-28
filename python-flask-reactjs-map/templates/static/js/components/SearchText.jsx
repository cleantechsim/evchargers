import React, { PureComponent } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

export class SearchText extends PureComponent {

    constructor(props) {
        super(props);
        
        this._onSearchTextChanged = this._onSearchTextChanged.bind(this);
        this._onSearchClicked = this._onSearchClicked.bind(this);
        
        this.state = { searchText : ""};
    }
    
    _onSearchTextChanged(text) {

        this.setState(state => ({ searchText : text }));
    }

    _onSearchClicked() {

        this.props.onSearch(this.state.searchText);
    }

    render() {

        return (            
            <div>
                <div id="search-input-view" className="p-float-label">
                    <InputText
                        id="search-input"
                        type="search"
                        placeholder="Country, city or street"
                        spellCheck="false"
                        onChange={ e => this._onSearchTextChanged(e.target.value) }
                        onKeyUp={ e => { if (e.key == 'Enter') { this._onSearchClicked() } }}
                        >    
                    </InputText>
                    {/*
                    <label htmlFor="search-input">Country, city or street</label>
                    */}
                </div>

                <Button
                    id="search-button"
                    label="Search"
                    onClick={ this._onSearchClicked }/>

            </div>);
    }
}
