import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccommodationOtherHistoryComponent } from './accommodation-other-history.component';

describe('AccommodationOtherHistoryComponent', () => {
  let component: AccommodationOtherHistoryComponent;
  let fixture: ComponentFixture<AccommodationOtherHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccommodationOtherHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccommodationOtherHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
