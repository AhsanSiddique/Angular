import { async, TestBed } from '@angular/core/testing';
import { ApiServerModule } from './api-server.module';

describe('ApiServerModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ApiServerModule],
    }).compileComponents();
  }));

  // TODO: Add real tests here.
  //
  // NB: This particular test does not do anything useful.
  //     It does NOT check for correct instantiation of the module.
  it('should have a module definition', () => {
    expect(ApiServerModule).toBeDefined();
  });
});
