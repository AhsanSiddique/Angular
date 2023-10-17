import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualUploadStep1Component } from './manual-upload-step1.component';

describe('ManualUploadStep1Component', () => {
  let component: ManualUploadStep1Component;
  let fixture: ComponentFixture<ManualUploadStep1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualUploadStep1Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualUploadStep1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
