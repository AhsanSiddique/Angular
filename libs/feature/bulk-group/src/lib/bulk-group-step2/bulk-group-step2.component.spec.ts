import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkGroupStep2Component } from './bulk-group-step2.component';

describe('BulkGroupStep2Component', () => {
  let component: BulkGroupStep2Component;
  let fixture: ComponentFixture<BulkGroupStep2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkGroupStep2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkGroupStep2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
