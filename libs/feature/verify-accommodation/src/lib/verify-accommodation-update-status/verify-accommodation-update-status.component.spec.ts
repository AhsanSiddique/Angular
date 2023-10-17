import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyAccommodationUpdateStatusComponent } from './verify-accommodation-update-status.component';

describe('VerifyAccommodationUpdateStatusComponent', () => {
  let component: VerifyAccommodationUpdateStatusComponent;
  let fixture: ComponentFixture<VerifyAccommodationUpdateStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyAccommodationUpdateStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyAccommodationUpdateStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
