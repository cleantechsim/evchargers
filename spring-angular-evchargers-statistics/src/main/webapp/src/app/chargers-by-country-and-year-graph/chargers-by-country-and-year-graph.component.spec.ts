import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargersByCountryAndYearGraphComponent } from './chargers-by-country-and-year-graph.component';

describe('ChargersByCountryAndYearGraphComponent', () => {
  let component: ChargersByCountryAndYearGraphComponent;
  let fixture: ComponentFixture<ChargersByCountryAndYearGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChargersByCountryAndYearGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargersByCountryAndYearGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
