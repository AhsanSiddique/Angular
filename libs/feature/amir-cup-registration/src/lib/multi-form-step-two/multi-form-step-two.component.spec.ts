import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiFormStepTwoComponent } from './multi-form-step-two.component';

describe('MultiFormStepTwoComponent', () => {
  let component: MultiFormStepTwoComponent;
  let fixture: ComponentFixture<MultiFormStepTwoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiFormStepTwoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiFormStepTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
