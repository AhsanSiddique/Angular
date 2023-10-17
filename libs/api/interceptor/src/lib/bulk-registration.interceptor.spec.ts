import { TestBed } from '@angular/core/testing';

import { BulkRegistrationInterceptor } from './bulk-registration.interceptor';

describe('BulkRegistrationInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      BulkRegistrationInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: BulkRegistrationInterceptor = TestBed.inject(BulkRegistrationInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
