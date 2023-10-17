import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadonlyInputComponent } from './readonly-input.component';

describe('ReadonlyInputComponent', () => {
  let component: ReadonlyInputComponent;
  let fixture: ComponentFixture<ReadonlyInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReadonlyInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadonlyInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
