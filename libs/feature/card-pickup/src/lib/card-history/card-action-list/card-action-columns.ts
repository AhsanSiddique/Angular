import { TCustomerCardActionGetListItemKey, TFilterColumnMap } from "@fan-id/api/server";
const columnMap: TFilterColumnMap<TCustomerCardActionGetListItemKey> = {
  // in table header order
  system_ModifiedOn: {
    title: "Date",
    type: "date"
  },
  fanIdNo: {
    title: "Hayya Card Number"
  },
  actionType_Name: {
    title: "Print Type"
  },
  statusMessage: {
    title: "Print Status"
  },
  reasonType_Name: {
    title: "Reason"
  },
  description: {
    title: "Description"
  },
  customerCardAction_RefSerivceCenter_Code_Name: {
    title: "Terminal Name"
  },
  requestPrinterName: {
    title: "Request Printer/Pool Name"
  },
  responsePrinterName: {
    title: "Printed On"
  },
  isProxyCollection: {
    title: "Proxy Collection",
    type: "boolean"
  },
  proxyDetails: {
    title: "Collected By"
  }
}

export const dataColumns = (Object.keys(columnMap) as TCustomerCardActionGetListItemKey[])
  .map(dataKey => ({
    title: columnMap[dataKey]?.title as string,
    dataKey,
    dataType: columnMap[dataKey]?.type ?? 'string',
    filter: columnMap[dataKey]?.filter ?? true
  }))

export const tableColumns = dataColumns.map(({ title, dataKey }) => ({
  title,
  data: dataKey
}))