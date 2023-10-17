import { KnowledgebaseService } from '@fan-id/api/server';
import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'fan-id-knowledge-base',
  templateUrl: './knowledge-base.component.html',
  styleUrls: ['./knowledge-base.component.scss']
})
export class KnowledgeBaseComponent implements OnInit {
  kbData=[];
  kbInitData=[];
  showInstructions=false;
  downloadFileName="";
    constructor(private kbService:KnowledgebaseService){}
  ngOnInit(): void {
    this.kbService.getDocuments({}).subscribe(response=>{
      this.kbData= response?.dataList;
      this.kbInitData.push(this.kbData.find(x=>x.sortorder === 1))
      this.kbData.sort((a,b) => a.sortorder < b.sortorder ? -1 : a.sortorder > b.sortorder ? 1 : 0)
      this.kbData.splice(0,1);
    });

  }
  close(){
    this.showInstructions=false;
  }
  downloadPdf(data:any){
    const filePath =data.trainingManualPath;
    this.downloadFileName = data.fileName;
    let filetype = {};
    if(data.extension == 'pdf')
    {
      filetype = { type: 'application/pdf' };
    }
    else   if(data.extension == 'xlsx'){
      filetype ={ type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };

    }
    this.kbService.downloadDoucment(filePath).subscribe(response=>{
      const file = new Blob([response], filetype)
      const fileURL = URL.createObjectURL(file);
      const a         = document.createElement('a');
      a.href        = fileURL;
      a.target      = '_blank';
      a.download    =  this.downloadFileName;
      document.body.appendChild(a);
      a.click();
    });

  }

}
