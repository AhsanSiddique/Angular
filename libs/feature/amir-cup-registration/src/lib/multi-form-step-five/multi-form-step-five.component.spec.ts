import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiFormStepFiveComponent } from './multi-form-step-five.component';

describe('MultiFormStepFiveComponent', () => {
  let component: MultiFormStepFiveComponent;
  let fixture: ComponentFixture<MultiFormStepFiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiFormStepFiveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiFormStepFiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
