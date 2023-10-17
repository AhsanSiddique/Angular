import { TestBed } from '@angular/core/testing';

import { ApplicantDetailResolver } from './applicant-detail.resolver';

describe('ApplicantDetailResolver', () => {
  let resolver: ApplicantDetailResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(ApplicantDetailResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
