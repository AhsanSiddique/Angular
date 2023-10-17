import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonDialogueComponent } from './common-dialogue.component';

describe('CommonDialogueComponent', () => {
  let component: CommonDialogueComponent;
  let fixture: ComponentFixture<CommonDialogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonDialogueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
