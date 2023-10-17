import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualUploadStep2Component } from './manual-upload-step2.component';

describe('ManualUploadStep2Component', () => {
  let component: ManualUploadStep2Component;
  let fixture: ComponentFixture<ManualUploadStep2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualUploadStep2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualUploadStep2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
