import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CardPickupService } from '@fan-id/api/server';
import { MenuService } from '@fan-id/core';
import { take } from 'rxjs/operators';

@Component({
  selector: 'fan-id-card-import-status',
  templateUrl: './card-import-status.component.html',
  styleUrls: ['./card-import-status.component.scss'],
})
export class CardImportStatusComponent {
  @Output() closeThis = new EventEmitter();

  translateKey = 'CardImportStatus'
  importForm = this.fb.group({
    importfile: [null, [Validators.required]],
    file: [null, [Validators.required]],
  });
  constructor(
    private fb: FormBuilder,
    private menuService: MenuService,
    private cardService: CardPickupService
  ) {}

  get f() {
    return this.importForm.controls;
  }

  get importfile() {
    return this.f.importfile;
  }

  uploadfile(args) {
    this.importfile.setErrors(null);
    if (args.target.files && args.target.files.length) {
      const file = <File>args.target.files[0];
      const fileTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      console.log(file.type)

      if (!fileTypes.includes(file.type)) {
        this.importfile.reset();
        this.importfile.markAsDirty();
        this.importfile.setErrors({filetype: true})
      } else {
        this.f.file.patchValue(file)
      }
    }
  }

  importExcel() {
    if(this.importForm.invalid) return;
    const { file } = this.importForm.value;
    const RefSerivceCenter_Code = this.menuService.getTerminalCode();
    const body = { file, RefSerivceCenter_Code };

    this.cardService.updateCardStatusFromFile(body)
    .pipe(take(1))
    .subscribe(response => {
      this.closeThis.emit({ action: 'success', data: response })
    }, err => {
      this.closeThis.emit({ action: 'fail', data: err })
    })
  }
}
