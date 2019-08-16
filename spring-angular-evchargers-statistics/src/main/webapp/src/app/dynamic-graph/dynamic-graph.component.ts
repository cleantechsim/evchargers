import { Component, Input, OnInit, AfterViewInit, Inject } from '@angular/core';
import { Chart, ChartDataSets } from 'chart.js';
import { DynamicGraphService } from '../dynamic-graph.service';
import { ChartJSData, ChartJSDataset } from '../chart-data';

@Component({
  selector: 'app-dynamic-graph',
  templateUrl: './dynamic-graph.component.html',
  styleUrls: ['./dynamic-graph.component.css']
})
export class DynamicGraphComponent<PARAMS> {

  @Input() graphId: string;

  graphTitle: string;

  private chart: Chart;

  private static convertDataSets(datasets: ChartJSDataset[]): ChartDataSets[] {
    const chartDataSets: ChartDataSets[] = [];

    for (const dataset of datasets) {

      const ds: ChartDataSets = {
        label: dataset.label,
        data: dataset.data,
        fill: false
      };

      chartDataSets.push(ds);
    }

    return chartDataSets;
  }

  constructor(private dynamicGraphService: DynamicGraphService<PARAMS>) {
    this.graphTitle = null;
  }

  public get divElementId(): string {
    return this.graphId;
  }

  public get canvasElementId() {
    return this.graphId + 'Canvas';
  }

  init(params: PARAMS): void {
    const canvasElement: HTMLCanvasElement = document.getElementById(this.canvasElementId) as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = canvasElement.getContext('2d');

    this.dynamicGraphService.getGraphData(this.graphId, params).subscribe(chartJSData => {

      this.chart = new Chart(ctx, this.createChartConfiguration(chartJSData));
    });
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
        }
      }
    };

    return config;
  }

  public update(params: PARAMS): void {
    this.dynamicGraphService.getGraphData(this.graphId, params).subscribe(data => {
      this.chart.data.datasets = DynamicGraphComponent.convertDataSets(data.datasets);

      this.chart.update();
    });
  }
}
