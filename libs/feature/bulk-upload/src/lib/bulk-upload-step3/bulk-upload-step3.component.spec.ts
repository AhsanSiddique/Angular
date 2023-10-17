import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUploadStep3Component } from './bulk-upload-step3.component';

describe('BulkUploadStep3Component', () => {
  let component: BulkUploadStep3Component;
  let fixture: ComponentFixture<BulkUploadStep3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkUploadStep3Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkUploadStep3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
