import { Component,Input, OnInit } from '@angular/core';

@Component({
  selector: 'fan-id-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {

  @Input() text:any;
  
  constructor() { }

  ngOnInit(): void {
    
  }

}
