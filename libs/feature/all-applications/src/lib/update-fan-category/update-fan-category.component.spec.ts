import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateFanCategoryComponent } from './update-fan-category.component';

describe('UpdateFanCategoryComponent', () => {
  let component: UpdateFanCategoryComponent;
  let fixture: ComponentFixture<UpdateFanCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateFanCategoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateFanCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
