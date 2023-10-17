import { TestBed } from '@angular/core/testing';

import { CardPickupService } from './card-pickup.service';

describe('CardPickupService', () => {
  let service: CardPickupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardPickupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
