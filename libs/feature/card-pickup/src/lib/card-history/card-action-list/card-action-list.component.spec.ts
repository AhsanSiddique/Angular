import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardActionListComponent } from './card-action-list.component';

describe('CardActionListComponent', () => {
  let component: CardActionListComponent;
  let fixture: ComponentFixture<CardActionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardActionListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardActionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
