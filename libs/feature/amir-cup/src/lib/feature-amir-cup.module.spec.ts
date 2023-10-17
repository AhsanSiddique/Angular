import { async, TestBed } from '@angular/core/testing';
import { FeatureAmirCupModule } from './feature-amir-cup.module';

describe('FeatureAmirCupModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FeatureAmirCupModule],
    }).compileComponents();
  }));

  // TODO: Add real tests here.
  //
  // NB: This particular test does not do anything useful.
  //     It does NOT check for correct instantiation of the module.
  it('should have a module definition', () => {
    expect(FeatureAmirCupModule).toBeDefined();
  });
});
