import React, { PureComponent } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { Button } from 'primereact/button';

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export class SearchText extends PureComponent {

    constructor(props) {
        super(props);
        
        this._onSearchTextChanged = this._onSearchTextChanged.bind(this);
        this._onSearchClicked = this._onSearchClicked.bind(this);
        
        this.state = {
            searchValue : "",
            suggestions : [ ],
        };
    }
    
    _onSearchTextChanged(text) {

        this.props.searchService.searchForPlaces(text, response => {

            const suggestions = [];

            for (var i = 0; i < response.results.length; ++ i) {

                const result = response.results[i];

                suggestions.push(result);
            }

            this.setState({ suggestions: suggestions });
        })

        this.setState(state => ({
            searchValue : text
        }));
    }

    _onSearchClicked() {

        const value = this.state.searchValue;

        if (typeof value === 'string') {
            this.props.onSearch(value);
        }
        else {
            this.props.onGotoLocation({ latitude : value.latitude, longitude : value.longitude });
        }
   }

    render() {

        return (            
            <div>
                <div id="search-input-view">
                    <AutoComplete
                        id="search-input"
                        value={this.state.searchValue}
                        placeholder="Country, town or street"
                        field="title"
                        suggestions={this.state.suggestions}
                        onKeyUp={ e => { if (e.key == 'Enter') { e.target.blur(); this._onSearchClicked() } }}
                        onChange={e => this.setState({searchValue: e.value})}
                        completeMethod={e => this._onSearchTextChanged(e.query)}
                        />
                </div>

                <Button
                    id="search-button"
                    label="Search"
                    onClick={ this._onSearchClicked }/>

            </div>);
    }
}
