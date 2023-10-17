import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUploadStep4Component } from './bulk-upload-step4.component';

describe('BulkUploadStep4Component', () => {
  let component: BulkUploadStep4Component;
  let fixture: ComponentFixture<BulkUploadStep4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkUploadStep4Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkUploadStep4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
