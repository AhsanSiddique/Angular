import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardReplacementListComponent } from './card-replacement-list.component';

describe('CardReplacementListComponent', () => {
  let component: CardReplacementListComponent;
  let fixture: ComponentFixture<CardReplacementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardReplacementListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardReplacementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
