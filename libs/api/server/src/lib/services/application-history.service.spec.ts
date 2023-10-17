import { TestBed } from '@angular/core/testing';

import { ApplicationHistoryService } from './application-history.service';

describe('ApplicationHistoryService', () => {
  let service: ApplicationHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
