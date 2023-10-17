import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkGroupStep1Component } from './bulk-group-step1.component';

describe('BulkGroupStep1Component', () => {
  let component: BulkGroupStep1Component;
  let fixture: ComponentFixture<BulkGroupStep1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkGroupStep1Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkGroupStep1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
