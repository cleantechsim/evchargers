import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicGraphComponent } from './dynamic-graph.component';
import { ChargersByCountryAndYearParams, ChargersByCountryAndYearService } from '../chargers-by-country-and-year.service';
import { ChartJSData } from '../chart.model';

describe('DynamicGraphComponent', () => {
  let component: DynamicGraphComponent<ChargersByCountryAndYearParams, ChartJSData>;
  let fixture: ComponentFixture<DynamicGraphComponent<ChargersByCountryAndYearParams, ChartJSData>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DynamicGraphComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
