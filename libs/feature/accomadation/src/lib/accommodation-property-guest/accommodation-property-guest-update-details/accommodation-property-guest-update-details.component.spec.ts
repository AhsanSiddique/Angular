import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccommodationPropertyGuestUpdateDetailsComponent } from './accommodation-property-guest-update-details.component';

describe('AccommodationPropertyGuestUpdateDetailsComponent', () => {
  let component: AccommodationPropertyGuestUpdateDetailsComponent;
  let fixture: ComponentFixture<AccommodationPropertyGuestUpdateDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccommodationPropertyGuestUpdateDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccommodationPropertyGuestUpdateDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
