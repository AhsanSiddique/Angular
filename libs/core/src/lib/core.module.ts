import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackDirective } from './directives/back.directive';
import { RemovewhitespacePipe } from './pipes/removewhitespace.pipe';
import { ObserveVisibilityDirective } from './directives/observe-visibility.directive';
import { DateFormatPipe } from './pipes/dateformat.pipe';
import { BlockCopyPasteDirective } from './directives/block-copy-paste.directive';
import { DebounceClickDirective } from './directives/debounce-click.directive';
import { DisableRightclickDirective } from './directives/disable-rightclick.directive';
import { SetApplicationStatusPipe } from './pipes/set-application-status.pipe';
import { SecureImagePipe } from './pipes/secure-image.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [
    BackDirective,
    RemovewhitespacePipe,
    ObserveVisibilityDirective,
    DateFormatPipe,
    BlockCopyPasteDirective,
    DebounceClickDirective,
    DisableRightclickDirective,
    SetApplicationStatusPipe,
    SecureImagePipe
  ],
  exports: [
    BackDirective,
    RemovewhitespacePipe,
    ObserveVisibilityDirective,
    DateFormatPipe,
    BlockCopyPasteDirective,
    DebounceClickDirective,
    DisableRightclickDirective,
    SetApplicationStatusPipe,
    SecureImagePipe
  ]
})
export class CoreModule {}
