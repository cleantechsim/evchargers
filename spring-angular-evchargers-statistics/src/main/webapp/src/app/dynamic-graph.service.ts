import { Observable } from 'rxjs';
import { ChartJSData } from './chart.model';

export interface DynamicGraphService<PARAMS, RESULT extends ChartJSData> {

  getGraphData(params: PARAMS): Observable<RESULT>;

}

