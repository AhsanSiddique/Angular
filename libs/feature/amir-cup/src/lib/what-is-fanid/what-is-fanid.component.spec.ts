import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatIsFanidComponent } from './what-is-fanid.component';

describe('WhatIsFanidComponent', () => {
  let component: WhatIsFanidComponent;
  let fixture: ComponentFixture<WhatIsFanidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WhatIsFanidComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WhatIsFanidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
