import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiFormStepOneComponent } from './multi-form-step-one.component';

describe('MultiFormStepOneComponent', () => {
  let component: MultiFormStepOneComponent;
  let fixture: ComponentFixture<MultiFormStepOneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiFormStepOneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiFormStepOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
