import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditApplicationDetailLocalComponent } from './edit-application-detail-local.component';

describe('EditApplicationDetailLocalComponent', () => {
  let component: EditApplicationDetailLocalComponent;
  let fixture: ComponentFixture<EditApplicationDetailLocalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditApplicationDetailLocalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditApplicationDetailLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
