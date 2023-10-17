import { TestBed } from '@angular/core/testing';

import { MultiformService } from './multiform.service';

describe('MultiformService', () => {
  let service: MultiformService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MultiformService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
