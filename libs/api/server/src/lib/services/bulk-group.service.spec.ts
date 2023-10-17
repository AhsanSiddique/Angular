import { TestBed } from '@angular/core/testing';

import { BulkGroupService } from './bulk-group.service';

describe('BulkGroupService', () => {
  let service: BulkGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BulkGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
