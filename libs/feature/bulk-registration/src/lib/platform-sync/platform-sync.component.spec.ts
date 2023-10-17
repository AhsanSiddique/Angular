import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatformSyncComponent } from './platform-sync.component';

describe('PlatformSyncComponent', () => {
  let component: PlatformSyncComponent;
  let fixture: ComponentFixture<PlatformSyncComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlatformSyncComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlatformSyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
