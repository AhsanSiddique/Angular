import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SitaComponent } from './sita.component';

describe('SitaComponent', () => {
  let component: SitaComponent;
  let fixture: ComponentFixture<SitaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SitaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SitaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
