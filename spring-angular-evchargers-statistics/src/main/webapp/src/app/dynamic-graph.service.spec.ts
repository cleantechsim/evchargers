import { TestBed } from '@angular/core/testing';

import { DynamicGraphService } from './dynamic-graph.service';
import { ChargersByCountryAndYearParams } from './chargers-by-country-and-year.service';

describe('DynamicGraphService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DynamicGraphService<ChargersByCountryAndYearParams> = TestBed.get(DynamicGraphService);
    expect(service).toBeTruthy();
  });
});
