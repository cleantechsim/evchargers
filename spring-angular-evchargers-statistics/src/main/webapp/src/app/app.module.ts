import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { DynamicGraphComponent } from './dynamic-graph/dynamic-graph.component';
import { ChargersByCountryAndYearService } from './chargers-by-country-and-year.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    DynamicGraphComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [ChargersByCountryAndYearService],
  bootstrap: [AppComponent]
})
export class AppModule { }
