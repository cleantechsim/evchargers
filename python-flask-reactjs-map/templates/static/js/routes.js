
import React from 'react';
import { HashRouter, Route, hashHistory } from 'react-router-dom';
import Search from './components/Search';

export default (
    <HashRouter history={hashHistory}>
     <div>
        <Route path='/' component={Search} />
     </div>
    </HashRouter>
);