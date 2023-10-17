import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualUploadFailedRecordsComponent } from './manual-upload-failed-records.component';

describe('ManualUploadFailedRecordsComponent', () => {
  let component: ManualUploadFailedRecordsComponent;
  let fixture: ComponentFixture<ManualUploadFailedRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualUploadFailedRecordsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualUploadFailedRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
