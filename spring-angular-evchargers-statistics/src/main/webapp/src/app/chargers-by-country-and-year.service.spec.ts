import { TestBed } from '@angular/core/testing';

import { ChargersByCountryAndYearService } from './chargers-by-country-and-year.service';

describe('ChargersByCountryAndYearService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChargersByCountryAndYearService = TestBed.get(ChargersByCountryAndYearService);
    expect(service).toBeTruthy();
  });
});
