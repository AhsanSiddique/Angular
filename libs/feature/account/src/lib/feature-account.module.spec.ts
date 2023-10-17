import { async, TestBed } from '@angular/core/testing';
import { FeatureAccountModule } from './feature-account.module';

describe('FeatureAccountModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FeatureAccountModule],
    }).compileComponents();
  }));

  // TODO: Add real tests here.
  //
  // NB: This particular test does not do anything useful.
  //     It does NOT check for correct instantiation of the module.
  it('should have a module definition', () => {
    expect(FeatureAccountModule).toBeDefined();
  });
});
