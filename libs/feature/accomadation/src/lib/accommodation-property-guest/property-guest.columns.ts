import { TFilterColumnMap, TPropertyGuestObjectKey } from "@fan-id/api/server";
const columnMap: TFilterColumnMap<TPropertyGuestObjectKey> = {
  // in table header order
  hostQID: {
    title: "Host QID",
  },
  hostFullName: {
    title: "Host Name",
  },
  hostEmail: {
    title: "Host Email ID",
  },
  hostQIDExpiryDate: {
    title: "Host Date of Birth",
    type: 'customDate',
    filter: false
  },
  property_Name: {
    title: "Property Name",
  },
  address1: {
    title: "Zone",
  },
  address2: {
    title: "Street",
  },
  address3: {
    title: "Building",
  },
  address4: {
    title: "Unit",
  },
  guestDocumentNumber: {
    title: "Guest Document Number",
  },
  guestName: {
    title: "Guest Name",
  },
  guestNationality_Name: {
    title: "Guest Nationality",
    filter: false
  },
  guestEmail: {
    title: "Guest Email ID",
  },
  system_CreatedOn: {
    title: "Guest Added On",
    type: 'date',
    filter: false
  },
  accommodationVerificationDate: {
    title: "Verified Date",
    type: 'date',
  },
}

export const dataColumns = (Object.keys(columnMap) as TPropertyGuestObjectKey[])
  .map(dataKey => ({
    title: columnMap[dataKey]?.title as string,
    dataKey,
    dataType: columnMap[dataKey]?.type ?? 'string',
    filter: columnMap[dataKey]?.filter ?? true
  }))
