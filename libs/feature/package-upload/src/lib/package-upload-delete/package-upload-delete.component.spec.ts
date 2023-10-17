import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageUploadDeleteComponent } from './package-upload-delete.component';

describe('PackageUploadDeleteComponent', () => {
  let component: PackageUploadDeleteComponent;
  let fixture: ComponentFixture<PackageUploadDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackageUploadDeleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageUploadDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
