import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateInfoAlertModalComponent } from './update-info-alert-modal.component';

describe('UpdateInfoAlertModalComponent', () => {
  let component: UpdateInfoAlertModalComponent;
  let fixture: ComponentFixture<UpdateInfoAlertModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateInfoAlertModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateInfoAlertModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
