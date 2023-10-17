import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditApplicationDetailComponent } from './edit-application-detail.component';

describe('EditApplicationDetailComponent', () => {
  let component: EditApplicationDetailComponent;
  let fixture: ComponentFixture<EditApplicationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditApplicationDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditApplicationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
