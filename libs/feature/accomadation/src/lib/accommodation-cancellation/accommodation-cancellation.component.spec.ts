import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccommodationCancellationComponent } from './accommodation-cancellation.component';

describe('AccommodationCancellationComponent', () => {
  let component: AccommodationCancellationComponent;
  let fixture: ComponentFixture<AccommodationCancellationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccommodationCancellationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccommodationCancellationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
