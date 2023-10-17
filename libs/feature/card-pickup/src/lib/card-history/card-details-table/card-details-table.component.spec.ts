import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardDetailsTableComponent } from './card-details-table.component';

describe('CardDetailsTableComponent', () => {
  let component: CardDetailsTableComponent;
  let fixture: ComponentFixture<CardDetailsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardDetailsTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardDetailsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
