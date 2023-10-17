import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintCardListDialogueComponent } from './print-card-list-dialogue.component';

describe('PrintCardListDialogueComponent', () => {
  let component: PrintCardListDialogueComponent;
  let fixture: ComponentFixture<PrintCardListDialogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintCardListDialogueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintCardListDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
