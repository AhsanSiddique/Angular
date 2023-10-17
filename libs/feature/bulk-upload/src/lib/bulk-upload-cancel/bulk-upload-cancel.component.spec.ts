import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUploadCancelComponent } from './bulk-upload-cancel.component';

describe('BulkUploadCancelComponent', () => {
  let component: BulkUploadCancelComponent;
  let fixture: ComponentFixture<BulkUploadCancelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkUploadCancelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkUploadCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
