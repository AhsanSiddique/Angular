import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkCreateOrderComponent } from './bulk-create-order.component';

describe('BulkCreateOrderComponent', () => {
  let component: BulkCreateOrderComponent;
  let fixture: ComponentFixture<BulkCreateOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkCreateOrderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkCreateOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
