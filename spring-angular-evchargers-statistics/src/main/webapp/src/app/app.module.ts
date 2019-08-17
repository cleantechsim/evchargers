import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { DynamicGraphComponent } from './dynamic-graph/dynamic-graph.component';
import { ChargersByCountryAndYearService } from './chargers-by-country-and-year.service';
import { CapacityByCountryAndYearService } from './capacity-by-country-and-year.service';
import { HttpClientModule } from '@angular/common/http';
import { ChargersByCountryAndYearGraphComponent } from './chargers-by-country-and-year-graph/chargers-by-country-and-year-graph.component';

@NgModule({
  declarations: [
    AppComponent,
    DynamicGraphComponent,
    ChargersByCountryAndYearGraphComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [ChargersByCountryAndYearService, CapacityByCountryAndYearService],
  bootstrap: [AppComponent]
})
export class AppModule { }
