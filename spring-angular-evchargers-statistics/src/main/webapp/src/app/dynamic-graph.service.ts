import { Observable } from 'rxjs';
import { ChartJSData } from './chart-data';

export interface DynamicGraphService<PARAMS, RESULT extends ChartJSData> {

  getGraphData(params: PARAMS): Observable<RESULT>;

}

