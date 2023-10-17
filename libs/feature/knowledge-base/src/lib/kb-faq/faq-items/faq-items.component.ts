import { Component, Input, OnInit } from '@angular/core';
import { KnowledgebaseService } from '@fan-id/api/server';

@Component({
  selector: 'fan-id-faq-items',
  templateUrl: './faq-items.component.html',
  styleUrls: ['./faq-items.component.scss']
})
export class FaqItemsComponent implements OnInit {
  @Input() data:any;
  selectedIndex:number|undefined
  counterSelect:number =0;
  constructor(private kbService:KnowledgebaseService) { }

  ngOnInit(): void {
    console.log("data> ",this.data)
  }

  imageShow(i){
    this.selectedIndex === i ? this.counterSelect++ :this.counterSelect = 0
    this.selectedIndex = this.counterSelect % 2 == 1 ?undefined: i
     }
  imageSrc(i){
    let src = '/assets/icons/up-arrow-kbfaq.svg'
    if(this.selectedIndex !== i){
      src = '/assets/icons/down-arrow-kbfaq.svg'
    }
    return src
  }
}
