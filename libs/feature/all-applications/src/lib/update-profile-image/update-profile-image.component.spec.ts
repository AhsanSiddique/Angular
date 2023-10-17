import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateProfileImageComponent } from './update-profile-image.component';

describe('UpdateProfileImageComponent', () => {
  let component: UpdateProfileImageComponent;
  let fixture: ComponentFixture<UpdateProfileImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateProfileImageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateProfileImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
