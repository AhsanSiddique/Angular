import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUploadStep1Component } from './bulk-upload-step1.component';

describe('BulkUploadStep1Component', () => {
  let component: BulkUploadStep1Component;
  let fixture: ComponentFixture<BulkUploadStep1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkUploadStep1Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkUploadStep1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
