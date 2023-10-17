import { BaseResponse } from "./api.model";

export class PrinterInsert{
    macAddress:string;
    printerType?:number;
    printerId?:string;
    printerPoolId?:string;
    refSerivceCenter_Code:string;
    //below for update
    id?:number;
    system_RowVersion?:string;
}

export interface IGetPrinterListByMacAddressRequest {
    macAddress: string;
    refSerivceCenter_Code: string;
}

export interface IGetPrinterListByMacAddressResponse extends BaseResponse {
    totalCount: number;
    dataList: IPrinterListItem[];
}

interface IPrinterListItem {
    printerType: number;
    printerId: string;
    printerPoolId: string;
    printer_Name: string;
    printerPool_Name: string;
    printerType_Name: TPrinterTypeName;
}

export type TPrinterTypeName = "Printer" | "Pool";