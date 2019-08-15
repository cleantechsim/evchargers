import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicGraphComponent } from './dynamic-graph.component';
import { ChargersByCountryAndYearParams } from '../chargers-by-country-and-year.service';

describe('DynamicGraphComponent', () => {
  let component: DynamicGraphComponent<ChargersByCountryAndYearParams>;
  let fixture: ComponentFixture<DynamicGraphComponent<ChargersByCountryAndYearParams>>;

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
