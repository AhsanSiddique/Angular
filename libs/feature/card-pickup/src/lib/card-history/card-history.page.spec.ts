import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardHistoryPage } from './card-history.page';

describe('CardHistoryPage', () => {
  let component: CardHistoryPage;
  let fixture: ComponentFixture<CardHistoryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardHistoryPage ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
