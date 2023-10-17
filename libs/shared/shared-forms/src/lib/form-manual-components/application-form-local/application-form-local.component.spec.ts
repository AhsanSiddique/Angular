import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationFormLocalComponent } from './application-form-local.component';

describe('ApplicationFormLocalComponent', () => {
  let component: ApplicationFormLocalComponent;
  let fixture: ComponentFixture<ApplicationFormLocalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicationFormLocalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationFormLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
