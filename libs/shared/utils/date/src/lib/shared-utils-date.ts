import { NgbDateStruct, NgbDate } from "@ng-bootstrap/ng-bootstrap";

export function convertNgbDateToISO(ngbDate: NgbDateStruct) {
  if(!ngbDate) return null;
  const { day, month, year } = ngbDate;
  const date = new Date(year, month - 1, day);
  return date.toLocaleString("sv").replace(" ", "T") + "Z";
}

export function convertDateStringToNgbDate(dateString: string): NgbDateStruct | null {
  const date = new Date(dateString);
  const isInvalidDate = isNaN(date.getTime());

  if(isInvalidDate) {
    return null;
  }

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  }
}

// dd/mm/yyyy -> mm/dd/yyyy, for new Date(mm/dd/yyyy)
export function convertDateDDMMYYYYToMMDDYYYY(dateString: string) {
  if(!dateString) return null;
  const delimiterChar = dateString[2];
  const [day, month, year] = dateString.split(delimiterChar);
  return [month, day, year].join(delimiterChar);
}

export function validateDateOfExpiry(dateOfExpiry: NgbDateStruct) {
  if(!dateOfExpiry) return false;

  const MIN_MONTH_GAP = 3;
  const eventStartDate = localStorage.getItem('eventStartDate');
  const _es = new Date(eventStartDate);
  const minDate = new Date(_es.setMonth(_es.getMonth() + MIN_MONTH_GAP)).setHours(0,0,0,0);

  const { day, month, year } = dateOfExpiry;
  const _dateOfExpiry = new Date(year, month - 1, day).setHours(0,0,0,0);
  return _dateOfExpiry - minDate >= 0;
}

function addPrefixZero(number) {
  return number < 10 ? '0' + number : number + '';
}

export function convertNgbDateToDDMMYYYY(ngbDate: NgbDateStruct, delimiterChar = '-') {
  const { day, month, year } = ngbDate;
  return [day, month, year].map(addPrefixZero).join(delimiterChar);
}

export function leapYear(year) {
  return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
}

export function getTodayNgb(): NgbDateStruct {
  const today = new Date();
  const day = today.getDate()+ 1;
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  return { day, month, year }
}


export function getThreeMonthsFromToday(): NgbDateStruct {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 4;
  const year = today.getFullYear();
  return { day, month, year }
}

export enum EUserCategoryType {
  FAN = 1,
  ORGANIZER = 2,
}

const MIN_DOCUMENT_EXPIRY_DATES = {
  [EUserCategoryType.FAN]: {
    day: 22,
    month: 3,
    year: 2023
  },
  [EUserCategoryType.ORGANIZER]: {
    day: 30,
    month: 3,
    year: 2023
  }
}

export type TMinDocumentExpiryDateType = keyof typeof MIN_DOCUMENT_EXPIRY_DATES;

export function getDocumentMinExpiryDate(type: TMinDocumentExpiryDateType = 1) {
  return MIN_DOCUMENT_EXPIRY_DATES[type] as NgbDate;
}

export function fromJSDate(jsDate: Date) {
  return new NgbDate(jsDate.getFullYear(), jsDate.getMonth() + 1, jsDate.getDate());
}

export function toJSDate(date: NgbDate) {
  const jsDate = new Date(date.year, date.month - 1, date.day, 12);
  // this is done avoid 30 -> 1930 conversion
  if (!isNaN(jsDate.getTime())) {
    jsDate.setFullYear(date.year);
  }
  return jsDate;
}

export type NgbPeriod = 'y' | 'm' | 'd';

export function getNext(date: NgbDate, period: NgbPeriod = 'd', number = 1) {
  const jsDate = toJSDate(date);
  let checkMonth = true;
  let expectedMonth = jsDate.getMonth();

  switch (period) {
    case 'y':
      jsDate.setFullYear(jsDate.getFullYear() + number);
      break;
    case 'm':
      expectedMonth += number;
      jsDate.setMonth(expectedMonth);
      expectedMonth = expectedMonth % 12;
      if (expectedMonth < 0) {
        expectedMonth = expectedMonth + 12;
      }
      break;
    case 'd':
      jsDate.setDate(jsDate.getDate() + number);
      checkMonth = false;
      break;
    default:
      return date;
  }

  if (checkMonth && jsDate.getMonth() !== expectedMonth) {
    // this means the destination month has less days than the initial month
    // let's go back to the end of the previous month:
    jsDate.setDate(0);
  }

  return fromJSDate(jsDate);
}

export function getPrev(date: NgbDate, period: NgbPeriod = 'd', number = 1) { return getNext(date, period, -number); }

export function isNgbDateGreaterThanToday(date: NgbDateStruct,app_type:string) {
  if(!date) return false;
  if(app_type === 'QRC') return true;
  const today = getTodayNgb();
  const {day, month, year} = date
  const _date = new NgbDate(year, month, day);
  return !(_date.before(today))
}

export function getQIDExpNgb(): NgbDateStruct {
  const today = new Date();
  const day =  1;
  const month =  1;
  const year = today.getFullYear() - 200;
  return { day, month, year }
}

export function checkPassportDateOfBirthBelowYear(dateofBirth: string, year: number, applicationDate = new Date()) {
  const DateOfBirth = convertDateStringToNgbDate(dateofBirth);
  const DateOfBirth_Ngb = new NgbDate(DateOfBirth.year, DateOfBirth.month, DateOfBirth.day);
  const dateToCompare = fromJSDate(new Date(applicationDate));
  const date_years_ago = getPrev(dateToCompare, 'y', year);
  return dateofBirth && DateOfBirth_Ngb.after(date_years_ago);
}

export const DIPLOMAT_QID_EXPIRY_DATE: NgbDateStruct = {
  day: 1,
  month: 1,
  year: 2000
}

// "2023-01-29"
export const FWC_MAX_DATE: NgbDateStruct = {
  day: 29,
  month: 1,
  year: 2023
};
