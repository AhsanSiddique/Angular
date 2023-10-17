import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KnowledgeBaseComponent } from './knowledge-base/knowledge-base.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@fan-id/feature/auth';
import { ApiServerModule } from '@fan-id/api/server';
import { UploadInstructionsComponent } from './upload-instructions/upload-instructions.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { KnowledgeBaseHeaderComponent } from './knowledge-base-header/knowledge-base-header.component';
import { KbFaqComponent } from './kb-faq/kb-faq.component';
import { KbVideoHubComponent } from './kb-video-hub/kb-video-hub.component';
import { FaqItemsComponent } from './kb-faq/faq-items/faq-items.component';
import { VideoHubItemsComponent } from './kb-video-hub/video-hub-items/video-hub-items.component';
import { KbYoutubePlayComponent } from './kb-video-hub/kb-youtube-play/kb-youtube-play.component';
import { CoreModule } from '@fan-id/core';

const routes: Routes = [
  {
    path: '',
    component: KnowledgeBaseHeaderComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ApiServerModule,
    NgbModule,
    CoreModule
  ],
  declarations: [
    KnowledgeBaseComponent,
    UploadInstructionsComponent,
    KnowledgeBaseHeaderComponent,
    KbFaqComponent,
    KbVideoHubComponent,
    FaqItemsComponent,
    VideoHubItemsComponent,
    KbYoutubePlayComponent
  ],
})

export class FeatureKnowledgeBaseModule { }
