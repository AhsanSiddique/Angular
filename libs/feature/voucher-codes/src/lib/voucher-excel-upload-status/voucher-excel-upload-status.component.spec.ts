import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoucherExcelUploadStatusComponent } from './voucher-excel-upload-status.component';

describe('VoucherExcelUploadStatusComponent', () => {
  let component: VoucherExcelUploadStatusComponent;
  let fixture: ComponentFixture<VoucherExcelUploadStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VoucherExcelUploadStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VoucherExcelUploadStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
