import { TestBed } from '@angular/core/testing';

import { CardDetailResolver } from './card-detail.resolver';

describe('CardDetailResolver', () => {
  let resolver: CardDetailResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(CardDetailResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
