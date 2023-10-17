import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'fan-id-knowledge-base-header',
  templateUrl: './knowledge-base-header.component.html',
  styleUrls: ['./knowledge-base-header.component.scss']
})
export class KnowledgeBaseHeaderComponent implements OnInit {
  active = 1;
  constructor() { }

  ngOnInit(): void {
  }
  activeTab(){
    
  }

}
