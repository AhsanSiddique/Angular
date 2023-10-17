import { TestBed } from '@angular/core/testing';

import { VerifyApplicationService } from './verify-application.service';

describe('VerifyApplicationService', () => {
  let service: VerifyApplicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VerifyApplicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
