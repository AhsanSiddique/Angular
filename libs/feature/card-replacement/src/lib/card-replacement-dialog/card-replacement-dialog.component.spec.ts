import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardReplacementDialogComponent } from './card-replacement-dialog.component';

describe('CardReplacementDialogComponent', () => {
  let component: CardReplacementDialogComponent;
  let fixture: ComponentFixture<CardReplacementDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardReplacementDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardReplacementDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
