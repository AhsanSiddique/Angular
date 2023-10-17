import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccomadationListComponent } from './accomadation-list.component';

describe('AccomadationListComponent', () => {
  let component: AccomadationListComponent;
  let fixture: ComponentFixture<AccomadationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccomadationListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccomadationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
