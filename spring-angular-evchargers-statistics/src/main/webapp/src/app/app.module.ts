import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { DynamicGraphComponent } from './dynamic-graph/dynamic-graph.component';
import { DynamicGraphService } from './dynamic-graph.service';
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
  providers: [DynamicGraphService],
  bootstrap: [AppComponent]
})
export class AppModule { }
