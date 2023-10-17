import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiFormStepFourComponent } from './multi-form-step-four.component';

describe('MultiFormStepFourComponent', () => {
  let component: MultiFormStepFourComponent;
  let fixture: ComponentFixture<MultiFormStepFourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiFormStepFourComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiFormStepFourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
