import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageCroppperComponent } from './image-croppper.component';

describe('ImageCroppperComponent', () => {
  let component: ImageCroppperComponent;
  let fixture: ComponentFixture<ImageCroppperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageCroppperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageCroppperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
