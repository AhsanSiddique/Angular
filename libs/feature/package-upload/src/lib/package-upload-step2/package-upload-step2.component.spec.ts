import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageUploadStep2Component } from './package-upload-step2.component';

describe('PackageUploadStep2Component', () => {
  let component: PackageUploadStep2Component;
  let fixture: ComponentFixture<PackageUploadStep2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackageUploadStep2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageUploadStep2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
