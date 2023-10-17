import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDocumentFormComponent } from './upload-document-form.component';

describe('UploadDocumentFormComponent', () => {
  let component: UploadDocumentFormComponent;
  let fixture: ComponentFixture<UploadDocumentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadDocumentFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadDocumentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
