import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ChargersByCountryAndYearParams } from './chargers-by-country-and-year.service';
import { DynamicGraphComponent } from './dynamic-graph/dynamic-graph.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements AfterViewInit {
  @ViewChild('chargersByCountryAndYear', null) chargersByCountryAndYear: DynamicGraphComponent<ChargersByCountryAndYearParams>;

  ngAfterViewInit(): void {

    this.chargersByCountryAndYear.init(new ChargersByCountryAndYearParams(10, null, null));

  }
}
