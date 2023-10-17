import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardImportStatusComponent } from './card-import-status.component';

describe('CardImportStatusComponent', () => {
  let component: CardImportStatusComponent;
  let fixture: ComponentFixture<CardImportStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardImportStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardImportStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
