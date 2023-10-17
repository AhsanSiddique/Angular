import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageUploadStep1Component } from './package-upload-step1.component';

describe('PackageUploadStep1Component', () => {
  let component: PackageUploadStep1Component;
  let fixture: ComponentFixture<PackageUploadStep1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackageUploadStep1Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageUploadStep1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
