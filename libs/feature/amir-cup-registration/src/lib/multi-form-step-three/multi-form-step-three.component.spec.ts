import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiFormStepThreeComponent } from './multi-form-step-three.component';

describe('MultiFormStepThreeComponent', () => {
  let component: MultiFormStepThreeComponent;
  let fixture: ComponentFixture<MultiFormStepThreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiFormStepThreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiFormStepThreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
