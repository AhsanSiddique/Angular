import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'fan-id-processing',
  templateUrl: './processing.component.html',
  styleUrls: ['./processing.component.scss']
})
export class ProcessingComponent implements OnInit {

  @Input() data:any;
  interval:any;
  counters;
  per;

  constructor() { }

  ngOnInit(): void {
    var a = 1
    this.interval = setInterval(() => {
      this.counters = a++;
      this.per = ((this.counters / this.data.totalCount)*100).toFixed(0);
      if(a > this.data.totalCount){
        clearInterval(this.interval);
      }
    }, 400);
  }

}
