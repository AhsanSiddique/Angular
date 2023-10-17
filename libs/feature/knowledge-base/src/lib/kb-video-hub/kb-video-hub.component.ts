import { Component, OnInit } from '@angular/core';
import { KnowledgebaseService } from '@fan-id/api/server';

@Component({
  selector: 'fan-id-kb-video-hub',
  templateUrl: './kb-video-hub.component.html',
  styleUrls: ['./kb-video-hub.component.scss']
})
export class KbVideoHubComponent implements OnInit {
  active =1;
  categoryNames=[];
  FAQcontent = [];
  constructor(private kbService:KnowledgebaseService) { }

  ngOnInit(): void {
    const filter = {
      filter: {
        faQ_CategoryType: 2,
       }
    }
    this.kbService.getFAQcategoryList(filter).subscribe(response=>{
      this.categoryNames = response.dataList ?? [];
      this.actveClick(0,this.categoryNames[0])
    },err=>{
      console.log(err)
    })
  }

  actveClick(index: number, item){
    this.active = index+1;
    const filter = {
      filter: {
        refFAQ_Category_Id: item.id,
       }
    }
    this.kbService.getFAQitemsList(filter).subscribe(data=>{
      console.log(data);
      this.FAQcontent = data.dataList ?? [];
      console.log(this.FAQcontent)
    },err=>{
      console.log(err)
    })
  }


}
