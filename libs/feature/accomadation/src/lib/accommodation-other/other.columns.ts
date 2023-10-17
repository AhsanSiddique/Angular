import { TAccommodationOtherGetListItemKey, TFilterColumnMap } from "@fan-id/api/server";
const columnMap: TFilterColumnMap<TAccommodationOtherGetListItemKey> = {
  // in table header order
  fanIdNo: {
    title: "Entry Reference Number",
  },
  hayyaNo: {
    title: "Hayya Number",
  },
  customer_FullName: {
    title: "Full Name",
    filter: false,
  },
  customer_Email: {
    title: "Email ID",
    filter: false,
  },
  documentIdNo: {
    title: "Document Number",
  },
  otherAccommodationStatus: {
    title: "Accommodation Status",
    filter: false,
    type: "otherAccommodationStatus",
    nameKey: "otherAccommodationStatus_Name",
  },
  accommodationVerificationDate: {
    title: "Accommodation Verification Date",
    type: "date",
  },
  accommodationName: {
    title: "Accommodation Name",
  },
  otherAccommodationCategory_Name: {
    title: "Accommodation Category",
    filter: false,
  },
  otherAccommodationCategory: {
    title: "Accommodation Category",
    viewInTable: false,
    type: "otherAccommodationCategory",
    filter: false,
  },
  accommodationStartDate: {
    title: "Accommodation Start Date",
    type: "date",
  },
  accommodationEndDate: {
    title: "Accommodation End Date",
    type: "date",
  },
  departureCountry_Name: {
    title: "Country of Departure",
    filter: false,
  },
  address: {
    title: "Accommodation Address",
    filter: false,
  },
  rejectReason: {
    title: "Comments",
    type: "rejectReason",
    filter: false,
  }
}

export const dataColumns = (Object.keys(columnMap) as TAccommodationOtherGetListItemKey[])
  .map(dataKey => ({
    title: columnMap[dataKey]?.title as string,
    dataKey,
    dataType: columnMap[dataKey]?.type ?? 'string',
    filter: columnMap[dataKey]?.filter ?? true,
    viewInTable: columnMap[dataKey]?.viewInTable ?? true,
    nameKey: columnMap[dataKey]?.nameKey
  }))
