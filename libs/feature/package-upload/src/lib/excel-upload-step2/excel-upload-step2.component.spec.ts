import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelUploadStep2Component } from './excel-upload-step2.component';

describe('ExcelUploadStep2Component', () => {
  let component: ExcelUploadStep2Component;
  let fixture: ComponentFixture<ExcelUploadStep2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExcelUploadStep2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExcelUploadStep2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
