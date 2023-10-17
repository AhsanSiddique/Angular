import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyAccommodationEditComponent } from './verify-accommodation-edit.component';

describe('VerifyAccommodationEditComponent', () => {
  let component: VerifyAccommodationEditComponent;
  let fixture: ComponentFixture<VerifyAccommodationEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyAccommodationEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyAccommodationEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
