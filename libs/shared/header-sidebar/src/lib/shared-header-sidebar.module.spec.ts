import { async, TestBed } from '@angular/core/testing';
import { SharedHeaderSidebarModule } from './shared-header-sidebar.module';

describe('SharedHeaderSidebarModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedHeaderSidebarModule],
    }).compileComponents();
  }));

  // TODO: Add real tests here.
  //
  // NB: This particular test does not do anything useful.
  //     It does NOT check for correct instantiation of the module.
  it('should have a module definition', () => {
    expect(SharedHeaderSidebarModule).toBeDefined();
  });
});
