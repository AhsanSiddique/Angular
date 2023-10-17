import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrinterManagementCreateOrUpdateComponent } from './printer-management-create-or-update.component';

describe('PrinterManagementCreateOrUpdateComponent', () => {
  let component: PrinterManagementCreateOrUpdateComponent;
  let fixture: ComponentFixture<PrinterManagementCreateOrUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrinterManagementCreateOrUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrinterManagementCreateOrUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
