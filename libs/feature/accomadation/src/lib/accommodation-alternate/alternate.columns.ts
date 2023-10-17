import { IAccommodationAlternateObjectKey, TFilterColumnMap } from "@fan-id/api/server";
const columnMap: TFilterColumnMap<IAccommodationAlternateObjectKey> = {
  // in table header order
  fanIdNo: {
    title: "Entry Reference Number",
  },
  hayyaNo: {
    title: "Hayya Number",
  },
  fullName: {
    title: "Guest Full Name",
  },
  guestEmail: {
    title: "Guest Email ID",
  },
  guestId: {
    title: "Guest ID",
    filter: false,
  },
  bookingRefDoumentNumber: {
    title: "Booking Doc. Number",
  },
  accommodationVerificationDate: {
    title: "Accommodation Verification Date",
    type: "date",
  },
  hostQID: {
    title: "Host QID",
  },
  property_Name: {
    title: "Property Name",
  },
  aA_Address1 : {
    title: "Zone",
  },
  aA_Address2: {
    title: "Street",
  },
  aA_Address3: {
    title: "Building",
  },
  aA_Address4: {
    title: "Unit",
  },
}

export const dataColumns = (Object.keys(columnMap) as IAccommodationAlternateObjectKey[])
  .map(dataKey => ({
    title: columnMap[dataKey]?.title as string,
    dataKey,
    dataType: columnMap[dataKey]?.type ?? 'string',
    filter: columnMap[dataKey]?.filter ?? true
  }))
