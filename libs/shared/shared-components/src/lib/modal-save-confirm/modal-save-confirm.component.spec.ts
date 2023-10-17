import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSaveConfirmComponent } from './modal-save-confirm.component';

describe('ModalSaveConfirmComponent', () => {
  let component: ModalSaveConfirmComponent;
  let fixture: ComponentFixture<ModalSaveConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalSaveConfirmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSaveConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
