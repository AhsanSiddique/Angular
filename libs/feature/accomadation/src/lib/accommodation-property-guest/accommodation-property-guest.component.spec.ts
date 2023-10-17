import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccommodationPropertyGuestComponent } from './accommodation-property-guest.component';

describe('AccommodationPropertyGuestComponent', () => {
  let component: AccommodationPropertyGuestComponent;
  let fixture: ComponentFixture<AccommodationPropertyGuestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccommodationPropertyGuestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccommodationPropertyGuestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
