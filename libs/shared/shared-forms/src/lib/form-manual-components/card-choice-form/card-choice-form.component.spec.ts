import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardChoiceFormComponent } from './card-choice-form.component';

describe('CardChoiceFormComponent', () => {
  let component: CardChoiceFormComponent;
  let fixture: ComponentFixture<CardChoiceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardChoiceFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardChoiceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
