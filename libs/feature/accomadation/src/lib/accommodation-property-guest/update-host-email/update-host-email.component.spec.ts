import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateHostEmailComponent } from './update-host-email.component';

describe('UpdateHostEmailComponent', () => {
  let component: UpdateHostEmailComponent;
  let fixture: ComponentFixture<UpdateHostEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateHostEmailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateHostEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
