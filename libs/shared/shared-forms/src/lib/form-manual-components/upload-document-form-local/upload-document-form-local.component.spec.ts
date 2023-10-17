import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDocumentFormLocalComponent } from './upload-document-form-local.component';

describe('UploadDocumentFormLocalComponent', () => {
  let component: UploadDocumentFormLocalComponent;
  let fixture: ComponentFixture<UploadDocumentFormLocalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadDocumentFormLocalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadDocumentFormLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
