import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoucherExportDialogComponent } from './voucher-export-dialog.component';

describe('VoucherExportDialogComponent', () => {
  let component: VoucherExportDialogComponent;
  let fixture: ComponentFixture<VoucherExportDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VoucherExportDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VoucherExportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
