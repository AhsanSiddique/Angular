import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveApplicationListComponent } from './approve-application-list.component';

describe('ApproveApplicationListComponent', () => {
  let component: ApproveApplicationListComponent;
  let fixture: ComponentFixture<ApproveApplicationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveApplicationListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveApplicationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
