import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageUploadSubmissionStatusComponent } from './package-upload-submission-status.component';

describe('PackageUploadSubmissionStatusComponent', () => {
  let component: PackageUploadSubmissionStatusComponent;
  let fixture: ComponentFixture<PackageUploadSubmissionStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackageUploadSubmissionStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageUploadSubmissionStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
