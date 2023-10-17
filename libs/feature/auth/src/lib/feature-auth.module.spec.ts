import { async, TestBed } from '@angular/core/testing';
import { FeatureAuthModule } from './feature-auth.module';

describe('FeatureAuthModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FeatureAuthModule],
    }).compileComponents();
  }));

  // TODO: Add real tests here.
  //
  // NB: This particular test does not do anything useful.
  //     It does NOT check for correct instantiation of the module.
  it('should have a module definition', () => {
    expect(FeatureAuthModule).toBeDefined();
  });
});
