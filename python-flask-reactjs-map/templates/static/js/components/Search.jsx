import React, { PureComponent } from 'react';

export default class Search extends PureComponent {
    render() {
        return (
            <div>
                <div id="search-input-view">
                    <input
                        id="search-input"
                        type="search"
                        placeholder="Country, city or street"
                        spellCheck="false"/>
                </div>

                <div id="search-button">Search</div>
            </div>);
    }
}
