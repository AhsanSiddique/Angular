import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KbVideoHubComponent } from './kb-video-hub.component';

describe('KbVideoHubComponent', () => {
  let component: KbVideoHubComponent;
  let fixture: ComponentFixture<KbVideoHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KbVideoHubComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KbVideoHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
