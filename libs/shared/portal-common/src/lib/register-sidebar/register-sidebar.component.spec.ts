import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterSidebarComponent } from './register-sidebar.component';

describe('RegisterSidebarComponent', () => {
  let component: RegisterSidebarComponent;
  let fixture: ComponentFixture<RegisterSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterSidebarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
