import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'fan-id-kb-youtube-play',
  templateUrl: './kb-youtube-play.component.html',
  styleUrls: ['./kb-youtube-play.component.scss']
})
export class KbYoutubePlayComponent implements OnInit {
  @Output() closeThis = new EventEmitter();
  @Input() src:string = '';
  constructor() { }

  ngOnInit(): void {
    console.log(this.src)
  }
  closefunction(){}

}
