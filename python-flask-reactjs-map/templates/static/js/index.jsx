
import React from 'react';
import ReactDOM from 'react-dom';
import { Page } from './components/Page';
import routes from './routes';


const searchService = new SearchService();

const element = <Page debug={false}/>

ReactDOM.render(element, document.getElementById('map-wrapper'));

// ReactDOM.render(routes, document.getElementById('search-view'));
