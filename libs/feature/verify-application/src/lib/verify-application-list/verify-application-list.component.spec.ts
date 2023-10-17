import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyApplicationListComponent } from './verify-application-list.component';

describe('VerifyApplicationListComponent', () => {
  let component: VerifyApplicationListComponent;
  let fixture: ComponentFixture<VerifyApplicationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyApplicationListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyApplicationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
