import { async, TestBed } from '@angular/core/testing';
import { FeatureAmirCupMainModule } from './feature-amir-cup-main.module';

describe('FeatureAmirCupMainModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FeatureAmirCupMainModule],
    }).compileComponents();
  }));

  // TODO: Add real tests here.
  //
  // NB: This particular test does not do anything useful.
  //     It does NOT check for correct instantiation of the module.
  it('should have a module definition', () => {
    expect(FeatureAmirCupMainModule).toBeDefined();
  });
});
