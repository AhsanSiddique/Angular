import { TestBed } from '@angular/core/testing';

import { CardIntegrationStatusResolver } from './card-integration-status.resolver';

describe('CardIntegrationStatusResolver', () => {
  let resolver: CardIntegrationStatusResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(CardIntegrationStatusResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
