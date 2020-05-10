
import React from 'react';
import ReactDOM from 'react-dom';
import { Page } from '../ts/components/Page';
import routes from './routes';
import { SearchService } from '../ts/searchservice';


const element = <Page debug={false}/>

ReactDOM.render(element, document.getElementById('map-wrapper'));

// ReactDOM.render(routes, document.getElementById('search-view'));
