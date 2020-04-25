import React, { PureComponent } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

export default class Search extends PureComponent {
    render() {
        return (
            
            <div>
                <div id="search-input-view" className="p-float-label">
                    <InputText id="search-input" type="search" spellCheck="false"></InputText>
                    {/*
                    <label htmlFor="search-input">Country, city or street</label>
                    */}
                </div>

                <Button id="search-button" label="Search"/>

            </div>);
    }
}
