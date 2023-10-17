import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KnowledgebaseService } from '@fan-id/api/server';

@Component({
  selector: 'fan-id-video-hub-items',
  templateUrl: './video-hub-items.component.html',
  styleUrls: ['./video-hub-items.component.scss']
})
export class VideoHubItemsComponent implements OnInit {
@Input() data:any;
displayURL:any;
openPlayerModal : boolean = false;
constructor(private sanitizer: DomSanitizer,
  private kbService:KnowledgebaseService) {
}

  ngOnInit(): void {
  }

  playVideo(url:string){
    this.displayURL = this.sanitizer.bypassSecurityTrustResourceUrl(url+'?autoplay=1&mute=1&rel=0')
    this.openPlayerModal=true;
  }

  imageSrc(image:string){
    let src = '/assets/images/fifa-cup.png'
    src = this.kbService.composeUserImageUrl(image, false)
    return src
  }

  videoTitleTrim(vdeoTitle:string){
    var title = vdeoTitle;
    var length = 69;
    var trimmedTitle = title.substring(0, length);
    if(vdeoTitle.length>69){
      trimmedTitle = trimmedTitle+' ...';
    }
    return trimmedTitle
  }

}
