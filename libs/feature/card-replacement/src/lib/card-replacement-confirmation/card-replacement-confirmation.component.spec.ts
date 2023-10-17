import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardReplacementConfirmationComponent } from './card-replacement-confirmation.component';

describe('CardReplacementConfirmationComponent', () => {
  let component: CardReplacementConfirmationComponent;
  let fixture: ComponentFixture<CardReplacementConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardReplacementConfirmationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardReplacementConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
