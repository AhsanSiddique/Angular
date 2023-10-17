import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccomadationService } from '@fan-id/api/server';
import { convertNgbDateToDDMMYYYY, convertNgbDateToISO } from '@fan-id/shared/utils/date';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { take } from 'rxjs/operators';

@Component({
  selector: 'fan-id-accommodation-export',
  templateUrl: './accommodation-export.component.html',
  styleUrls: ['./accommodation-export.component.scss']
})
export class AccommodationExportComponent implements OnInit {
  @Output() closeThis = new EventEmitter();
  @Output() dashFilterDate = new EventEmitter<any>();
  @Input() type:number = 0;
  @Input() tName?:string ='';
  @Input() startFieldName:string='';
  @Input() endFieldName:string='';
  @Input() apiName='/api/Accommodation/generateExcelAccommodation';
  @Input() downloadBtnTxt:string = 'Download';
  @Input() closeBtnTxt:string = 'Close';

  dateToday!: NgbDateStruct;
  exportForm:FormGroup;
  constructor(
    private fb: FormBuilder,
    private accomadationService:AccomadationService) {
      const today = new Date();
      this.dateToday = {
        year: today.getFullYear(),
        month: today.getMonth()+1,
        day: today.getDate(),
      };
    this.exportForm = this.fb.group({
      dateBegin: [null, [Validators.required]],
      dateEnd: [null, [Validators.required]]
    });
   }

  ngOnInit(): void {
  }
  get ef() {
    return this.exportForm.controls;
  }
  generateExcel(){
    if(this.exportForm.invalid) return;
    const body = this.exportForm.value as any;
    if(this.type===7){
      this.dashFilterDate.emit(body);
    }
    else{
      if(this.type === 6){
        body.dateBegin = convertNgbDateToISO(body.dateBegin as unknown as NgbDateStruct);
        body.dateEnd = convertNgbDateToISO(body.dateEnd as unknown as NgbDateStruct);
      }
      else{
        body.dateBegin = convertNgbDateToDDMMYYYY(body.dateBegin as unknown as NgbDateStruct);
        body.dateEnd = convertNgbDateToDDMMYYYY(body.dateEnd as unknown as NgbDateStruct);
      }
        const { dateBegin, dateEnd } = body;
        var _body: any
        if(this.type === 1 || this.type === 2 ){
          _body = {
            accommodationVerificationDateBegin:dateBegin,
            accommodationVerificationDateEnd:dateEnd,
            accommodationType: this.type
          }
        }
        else if(this.type === 4 || this.type === 3|| this.type === 5 || this.type === 8){
          _body = {
            accommodationVerificationDateBegin:dateBegin,
            accommodationVerificationDateEnd:dateEnd
          }
        }
        else if(this.type === 6){
          _body = {
            startDate:dateBegin,
            endDate:dateEnd
          }
        }
        else{
          return;
        }
        const filter = this.type === 6 ? { ..._body } : { filter:_body };
        console.log(_body);
        this.accomadationService.downloadAccommodationExcel(filter,this.apiName)
        .pipe(take(1))
        .subscribe(blob => {
          this.downloadExcel({blob, body});
          this.closeThis.emit('close')
        }, err => {
          console.log({err});
          alert('Something went wrong!');
        })
    }
  }

  downloadExcel({blob, body}: {blob: Blob, body: any}) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    const linkText = document.createTextNode("Download File");
    const filename = `${this.tName}_${body.dateBegin}_${body.dateEnd}.xlsx`
    a.appendChild(linkText);
    a.setAttribute('download',filename);
    a.href = url;
    a.click();
    a.remove();
  }

}
