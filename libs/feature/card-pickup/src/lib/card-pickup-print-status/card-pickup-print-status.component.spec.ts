import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPickupPrintStatusComponent } from './card-pickup-print-status.component';

describe('CardPickupPrintStatusComponent', () => {
  let component: CardPickupPrintStatusComponent;
  let fixture: ComponentFixture<CardPickupPrintStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardPickupPrintStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardPickupPrintStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
