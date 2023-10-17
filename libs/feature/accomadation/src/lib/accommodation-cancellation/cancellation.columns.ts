import { IAccommodationCancellationListResponseObjectKey, TFilterColumnMap } from "@fan-id/api/server";
const columnMap: TFilterColumnMap<IAccommodationCancellationListResponseObjectKey> = {
  // in table header order
  fanIdNo: {
    title: "Entry Reference Number",
  },
  hayyaNo: {
    title: "Hayya Number",
  },
  emailAddress: {
    title: "Email ID",
  },
  accommodationType_Name: {
    title: "Accommodation Type",
  },
  bookingRefNumber: {
    title: "Booking Ref. Number",
  },
  bookingRefDoumentNumber: {
    title: "Document Number",
  },
  bookingStatus: {
    title: "Booking Status",
  },
  expectedCheckInDate: {
    title: "Expected Check-in Date",
    type: "date",
  },
  expectedCheckOutDate: {
    title: "Expected Check-out Date",
    type: "date",
  },
  bookingCancellationDate: {
    title: "Booking Cancellation Date",
    type: "date",
  },
  mainGuest: {
    title: "Main Guest",
    type:"boolean",
  },
  system_CreatedOn: {
    title: "Created Date",
    type: "date",
    filter: false,
  },
  system_CreatedBy: {
    title: "Created By",
    filter: false,
  },
  system_ModifiedOn: {
    title: "Updated Date",
    type: "date",
    filter: false,
  },
  system_ModifiedBy: {
    title: "Updated By",
    filter: false,
  }
}

export const dataColumns = (Object.keys(columnMap) as IAccommodationCancellationListResponseObjectKey[])
  .map(dataKey => ({
    title: columnMap[dataKey]?.title as string,
    dataKey,
    dataType: columnMap[dataKey]?.type ?? 'string',
    filter: columnMap[dataKey]?.filter ?? true
  }))
