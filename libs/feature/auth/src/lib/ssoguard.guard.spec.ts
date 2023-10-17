import { TestBed } from '@angular/core/testing';

import { SsoguardGuard } from './ssoguard.guard';

describe('SsoguardGuard', () => {
  let guard: SsoguardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(SsoguardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
