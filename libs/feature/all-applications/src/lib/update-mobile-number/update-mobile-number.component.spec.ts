import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateMobileNumberComponent } from './update-mobile-number.component';

describe('UpdateMobileNumberComponent', () => {
  let component: UpdateMobileNumberComponent;
  let fixture: ComponentFixture<UpdateMobileNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateMobileNumberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateMobileNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
