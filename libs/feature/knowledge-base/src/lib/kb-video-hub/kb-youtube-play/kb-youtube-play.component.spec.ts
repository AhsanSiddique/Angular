import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KbYoutubePlayComponent } from './kb-youtube-play.component';

describe('KbYoutubePlayComponent', () => {
  let component: KbYoutubePlayComponent;
  let fixture: ComponentFixture<KbYoutubePlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KbYoutubePlayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KbYoutubePlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
