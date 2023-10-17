import { TestBed } from '@angular/core/testing';

import { BulkRegistrationService } from './bulk-registration.service';

describe('BulkRegistrationService', () => {
  let service: BulkRegistrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BulkRegistrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
