import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountOtpDialogComponent } from './account-otp-dialog.component';

describe('AccountOtpDialogComponent', () => {
  let component: AccountOtpDialogComponent;
  let fixture: ComponentFixture<AccountOtpDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountOtpDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountOtpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
