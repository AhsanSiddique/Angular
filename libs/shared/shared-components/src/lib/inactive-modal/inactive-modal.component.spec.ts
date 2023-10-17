import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveModalComponent } from './inactive-modal.component';

describe('InactiveModalComponent', () => {
  let component: InactiveModalComponent;
  let fixture: ComponentFixture<InactiveModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InactiveModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InactiveModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
