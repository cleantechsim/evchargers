import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CapacityByCountryAndYearGraphComponent } from './capacity-by-country-and-year-graph.component';

describe('CapacityByCountryAndYearGraphComponent', () => {
  let component: CapacityByCountryAndYearGraphComponent;
  let fixture: ComponentFixture<CapacityByCountryAndYearGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CapacityByCountryAndYearGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CapacityByCountryAndYearGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
