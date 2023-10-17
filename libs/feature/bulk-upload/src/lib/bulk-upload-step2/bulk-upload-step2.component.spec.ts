import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUploadStep2Component } from './bulk-upload-step2.component';

describe('BulkUploadStep2Component', () => {
  let component: BulkUploadStep2Component;
  let fixture: ComponentFixture<BulkUploadStep2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkUploadStep2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkUploadStep2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
