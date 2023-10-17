import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyApplicationEditComponent } from './verify-application-edit.component';

describe('VerifyApplicationEditComponent', () => {
  let component: VerifyApplicationEditComponent;
  let fixture: ComponentFixture<VerifyApplicationEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyApplicationEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyApplicationEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
