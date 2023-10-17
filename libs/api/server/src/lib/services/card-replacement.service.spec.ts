import { TestBed } from '@angular/core/testing';

import { CardReplacementService } from './card-replacement.service';

describe('CardReplacementService', () => {
  let service: CardReplacementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardReplacementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
