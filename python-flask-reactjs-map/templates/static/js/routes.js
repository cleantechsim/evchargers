
import React from 'react';
import { HashRouter, Route, hashHistory } from 'react-router-dom';
import SearchView from './components/SearchView';

export default (
    <HashRouter history={hashHistory}>
     <div>
        <Route path='/' component={SearchView} />
     </div>
    </HashRouter>
);