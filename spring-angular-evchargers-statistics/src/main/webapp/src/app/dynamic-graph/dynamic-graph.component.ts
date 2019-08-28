import { Observable, Subject } from 'rxjs';
import { Component, Input } from '@angular/core';
import { Chart, ChartDataSets } from 'chart.js';
import { DynamicGraphService } from '../dynamic-graph.service';
import { ChartJSData, ChartJSDataset } from '../chart.model';
import { Color } from '../color.util';

@Component({
  selector: 'app-dynamic-graph',
  templateUrl: './dynamic-graph.component.html',
  styleUrls: ['./dynamic-graph.component.css']
})
export class DynamicGraphComponent<PARAMS, RESULT extends ChartJSData> {

  @Input() graphId: string;

  graphTitle: string;

  private chart: Chart;

  private static convertDataSets(datasets: ChartJSDataset[]): ChartDataSets[] {
    const chartDataSets: ChartDataSets[] = [];

    for (const dataset of datasets) {

      const color: Color = dataset.color;

      const ds: ChartDataSets = {
        label: dataset.label,
        data: dataset.data,
        borderColor: 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')',
        fill: false
      };

      chartDataSets.push(ds);
    }

    return chartDataSets;
  }

  constructor() {
    this.graphTitle = null;
  }

  public get divElementId(): string {
    return this.graphId;
  }

  public get canvasElementId() {
    return this.graphId + 'Canvas';
  }

  init(params: PARAMS, dynamicGraphService: DynamicGraphService<PARAMS, RESULT>): Observable<RESULT> {

    const canvasElement: HTMLCanvasElement = document.getElementById(this.canvasElementId) as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = canvasElement.getContext('2d');

    const result: Subject<RESULT> = new Subject<RESULT>();

    dynamicGraphService.getGraphData(params).subscribe(chartJSData => {

      this.chart = new Chart(ctx, this.createChartConfiguration(chartJSData));

      result.next(chartJSData);
    });

    return result;
  }

  private createChartConfiguration(chartData: ChartJSData): Chart.ChartConfiguration {

    const config: Chart.ChartConfiguration = {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: DynamicGraphComponent.convertDataSets(chartData.datasets)
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        },

        responsive: true,
        maintainAspectRatio: false
      }
    };

    return config;
  }

  public update(params: PARAMS, dynamicGraphService: DynamicGraphService<PARAMS, RESULT>): Observable<RESULT> {

    const result: Subject<RESULT> = new Subject<RESULT>();

    dynamicGraphService.getGraphData(params).subscribe(data => {
      this.chart.data.labels = data.labels;
      this.chart.data.datasets = DynamicGraphComponent.convertDataSets(data.datasets);

      this.chart.update();

      result.next(data);
    });

    return result;
  }
}
