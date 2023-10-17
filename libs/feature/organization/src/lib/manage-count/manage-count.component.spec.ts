import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCountComponent } from './manage-count.component';

describe('ManageCountComponent', () => {
  let component: ManageCountComponent;
  let fixture: ComponentFixture<ManageCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageCountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
