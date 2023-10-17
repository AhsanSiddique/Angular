import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalDetailsLocalComponent } from './personal-details-local.component';

describe('PersonalDetailsLocalComponent', () => {
  let component: PersonalDetailsLocalComponent;
  let fixture: ComponentFixture<PersonalDetailsLocalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonalDetailsLocalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalDetailsLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
