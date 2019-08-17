import { TestBed } from '@angular/core/testing';

import { CapacityByCountryAndYearService } from './capacity-by-country-and-year.service';

describe('CapacityByCountryAndYearService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CapacityByCountryAndYearService = TestBed.get(CapacityByCountryAndYearService);
    expect(service).toBeTruthy();
  });
});
