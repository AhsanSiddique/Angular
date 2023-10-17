import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'fan-id-processing',
  templateUrl: './processing.component.html',
  styleUrls: ['./processing.component.scss']
})
export class ProcessingComponent implements OnInit {

  @Input() totalLimit
  @Input() counter
  @Output() closeThis = new EventEmitter();
  interval:any;
  counters;
  per;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() { }

  ngOnInit(): void {
    let intervalTime= 70;
    if(this.totalLimit >1000)
    {
      intervalTime = 3;
    }
    else if(this.totalLimit >500)
    {
      intervalTime = 7;
    }
    else if(this.totalLimit >200)
    {
      intervalTime = 15;
    }
    else if(this.totalLimit >100)
    {
      intervalTime = 30;
    }
    else if(this.totalLimit <=1)
    {
      intervalTime = 0;
      this.closeThis.emit();

    //  this.totalLimit =1;
    }
    let a = 1
    this.interval = setInterval(() => {
      this.counters = a++;
      this.per = ((this.counters / this.totalLimit)*100).toFixed(0);
      if(a > this.totalLimit){
        clearInterval(this.interval);
      }
      if(a ===this.totalLimit){
        this.closeThis.emit();
      }
    }, intervalTime);
  }

}
