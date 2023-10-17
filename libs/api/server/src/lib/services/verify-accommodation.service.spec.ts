import { TestBed } from '@angular/core/testing';

import { VerifyAccommodationService } from './verify-accommodation.service';

describe('VerifyAccommodationService', () => {
  let service: VerifyAccommodationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VerifyAccommodationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
