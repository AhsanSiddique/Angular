import { TestBed } from '@angular/core/testing';

import { AccomadationService } from './accomadation.service';

describe('AccomadationService', () => {
  let service: AccomadationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccomadationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
