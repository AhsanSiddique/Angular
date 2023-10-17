import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { IGetPrinterListByMacAddressRequest, PrinterManagementService, TPrinterTypeName } from '@fan-id/api/server';
import { CoreService } from '@fan-id/core';
import { getFromLocalStorage } from '@fan-id/shared/utils/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

enum EPrinterSetupModal {
  NONE = 'NONE',
  DOWNLOAD_OR_SELECT_PRINTER = 'DOWNLOAD_OR_SELECT_PRINTER',
  SELECT_PRINTER = 'SELECT_PRINTER'
}
enum EPrinterType {
  Printer,
  PrinterPool,
}
interface IModalConfig {
  macFound: boolean;
}
interface IPrinterListItem {
  bulkPrintingServiceCenterName: string | null;
  id: number
  printer_Id: string
  printer_Name: string
  refbulkPrinterId: string | null
  system_RowVersion: string
}
interface IPrinterPoolListItem {
  emails: string
  id: number
  isEnabled: boolean
  printerPoolId: string
  printerSC_Name: string
  refTerminal_Id: number
  system_RowVersion: string
  terminal_Name: string
}
export interface IPrinter {
  printerId: string
  printerName: string
  printerType: EPrinterType
  printerTypeName: TPrinterTypeName
}
type TPrinterItem = IPrinterListItem | IPrinterPoolListItem;

export const PRINTER_STORAGE_KEY = 'Printer';
const DefaultModalConfig: IModalConfig = { macFound: false };
const isPrinterPool = (printer: TPrinterItem): printer is IPrinterPoolListItem => "printerPoolId" in printer;
const isPrinter = (printer: TPrinterItem): printer is IPrinterListItem => "printer_Id" in printer;

@Component({
  selector: 'fan-id-printer-setup',
  templateUrl: './printer-setup.component.html',
  styleUrls: ['./printer-setup.component.scss']
})
export class PrinterSetupComponent implements OnInit {
  @Output() printerSelected = new EventEmitter<IPrinter>();
  EPrinterType = EPrinterType;
  spinner_name = "printer-setup-spinner";
  selected_printer: IPrinter | null = null;
  selected_terminal: { code: string } | null = null;
  currentModal: EPrinterSetupModal = EPrinterSetupModal.NONE;
  selectPrinterModalConfig: IModalConfig = {
    macFound: false,
  }
  printerDropdownLabel = "Printer Name";
  printerList$: Observable<IPrinterListItem[]>;
  printerPoolList$: Observable<IPrinterPoolListItem[]>;
  selectPrinterForm = this.fb.group({
    printerType: [EPrinterType.Printer, [Validators.required]],
    printer: [null, [Validators.required]],
  })
  socket: WebSocket;
  terminalId:number;
  constructor(
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private coreService: CoreService,
    private printerService: PrinterManagementService
  ) { }

  ngOnInit() {
    this.selected_printer = getFromLocalStorage({ key: PRINTER_STORAGE_KEY, parse: true });
    this.selected_terminal = getFromLocalStorage({ key: 'Terminal', parse: true });
    if (this.selected_terminal?.code === 'SUP') return;
    if (this.selected_printer) {
      this.printerSelected.emit(this.selected_printer);
      return;
    } 
    this.showSpinner();
    this.getMACandPrinterConfigs();
    this.getPrinterList();
  }

  getMACandPrinterConfigs() {
    this.socket = new WebSocket('ws://localhost:8200');
    this.socket.onerror = () => {
      this.socket.close();
      this.hideSpinner();
      console.log('Websocket Error');
      this.showDownloadOrSelectPrinterModal();
    }

    this.socket.onmessage = (message) => {
      console.log('Mac Address Received', message?.data);
      const macAddress = message?.data;
      this.getPrinterListOfMACAddress(macAddress).subscribe({
        next: (printer) => {
          this.printerSelected.emit(printer);
          this.hideSpinner();
          this.socket.close();
        },
        error: (err) => {
          this.hideSpinner();
          console.log('Error', err);
          this.showSelectPrinterModal({ macFound: true });
          this.socket.close();
        }
      })
    }

    this.socket.onopen = () => {
      console.log('Websocket Open');
      this.socket.send('macAddress');
    }

    this.socket.onclose = () => {
      console.log('Websocket Close');
    }
  }

  downloadMacExe() {
    const link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.href = 'assets/macAddress/Mannai-ScMacAddress.exe';
    link.download = 'Mannai-ScMacAddress.exe';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  get spf() {
    return this.selectPrinterForm.controls;
  }

  resetSelectPrinterForm() {
    this.spf.printerType.reset(EPrinterType.Printer);
    this.spf.printer.reset();
  }

  submitSelectPrinterForm() {
    const { printer } = this.selectPrinterForm.value;
    if (isPrinterPool(printer)) {
      const { printerPoolId, printerSC_Name } = printer;
      this.selected_printer = {
        printerId: printerPoolId,
        printerName: printerSC_Name,
        printerType: EPrinterType.PrinterPool,
        printerTypeName: 'Pool'
      }
    } else if (isPrinter(printer)) {
      const { printer_Id, printer_Name } = printer;
      this.selected_printer = {
        printerId: printer_Id,
        printerName: printer_Name,
        printerType: EPrinterType.Printer,
        printerTypeName: 'Printer'
      }
    }
    this.currentModal = EPrinterSetupModal.NONE;
    this.printerSelected.emit(this.selected_printer);
  }

  selectPrinterType(type: EPrinterType) {
    if (type === EPrinterType.Printer) {
      this.printerDropdownLabel = "Printer Name";
    } else if (type === EPrinterType.PrinterPool) {
      this.printerDropdownLabel = "Printer Pool Name";
    }
    this.spf.printer.reset();
  }

  getPrinterListOfMACAddress(MACAddress: string) {
    const body: IGetPrinterListByMacAddressRequest = {
      macAddress: MACAddress,
      refSerivceCenter_Code: this.selected_terminal?.code,
    }
    return this.printerService.getPrinterListByMacAddress(body).pipe(
      map(response => {
        const { dataList } = response ?? {};
        if (!dataList?.length) {
          throw new Error('No Printer Found');
        }
        const printer: IPrinter = {
          printerType: dataList[0].printerType,
          printerId: dataList[0].printerId ?? dataList[0].printerPoolId,
          printerName: dataList[0].printer_Name ?? dataList[0].printerPool_Name,
          printerTypeName: dataList[0].printerType_Name,
        }
        return printer;
      })
    )
  }

  getPrinterList() {
    this.terminalId = JSON.parse(localStorage.getItem('Terminal')).id;
    this.printerList$ = this.printerService.getPrinterList().pipe(
      map(response => 
        response?.dataList.filter(r=> r.refTerminal_Id === this.terminalId) ?? []),
      catchError(error => {
        console.log('getPrinterList', error);
        return of([]);
      })
    );
    this.printerPoolList$ = this.printerService.getPrinterPoolList().pipe(
      map(response => (response?.dataList.filter(r=> r.refTerminal_Id === this.terminalId) ?? []).filter(printer => printer?.isEnabled)),
      catchError(error => {
        console.log('getPrinterPoolList', error);
        return of([]);
      })
    );
  }

  downloadPrinterSetup() {
    this.currentModal = EPrinterSetupModal.NONE;
    this.downloadMacExe();
    this.coreService.logout();
  }

  showDownloadOrSelectPrinterModal() {
    this.currentModal = EPrinterSetupModal.DOWNLOAD_OR_SELECT_PRINTER;
  }

  showSelectPrinterModal(config: Partial<IModalConfig> = DefaultModalConfig) {
    this.selectPrinterModalConfig = { ...this.selectPrinterModalConfig, ...config };
    this.currentModal = EPrinterSetupModal.SELECT_PRINTER;
  }

  backToDownloadOrSelectModal() {
    this.resetSelectPrinterForm();
    this.showDownloadOrSelectPrinterModal();
  }

  showSpinner(name = this.spinner_name) {
    this.spinner.show(name);
  }

  hideSpinner(name = this.spinner_name) {
    this.spinner.hide(name);
  }

}
