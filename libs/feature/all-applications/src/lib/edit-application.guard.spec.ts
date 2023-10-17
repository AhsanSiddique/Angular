import { TestBed } from '@angular/core/testing';

import { EditApplicationGuard } from './edit-application.guard';

describe('EditApplicationGuard', () => {
  let guard: EditApplicationGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(EditApplicationGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
