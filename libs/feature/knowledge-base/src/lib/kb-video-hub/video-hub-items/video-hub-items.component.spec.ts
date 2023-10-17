import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoHubItemsComponent } from './video-hub-items.component';

describe('VideoHubItemsComponent', () => {
  let component: VideoHubItemsComponent;
  let fixture: ComponentFixture<VideoHubItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoHubItemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoHubItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
