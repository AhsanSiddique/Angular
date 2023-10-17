import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintCardDialogueComponent } from './print-card-dialogue.component';

describe('PrintCardDialogueComponent', () => {
  let component: PrintCardDialogueComponent;
  let fixture: ComponentFixture<PrintCardDialogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintCardDialogueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintCardDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
