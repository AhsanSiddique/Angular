import { Buffer } from 'buffer';

export function nationalitySearchFn(term: string, item:any) {
  return item.name.toLowerCase().startsWith(term.toLowerCase())
}

export function dialingCodeSearchFn(term: string, item: {code: string, name: string, dialingCode: `+${string}`}) {
  const t = term?.toLowerCase();
  if (t.startsWith('+')) {
    return item.dialingCode.includes(t);
  }
  if (isNaN(+t)) {
    return item.name.toLowerCase().startsWith(t) || item.code.toLowerCase().startsWith(t);
  }
  return item.dialingCode.includes(`+${t}`);
}


export function dataURItoBlob(dataURI: string) {
  const byteString = window.atob(dataURI);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const int8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    int8Array[i] = byteString.charCodeAt(i);
  }
  return new Blob([int8Array], { type: 'image/png' });
}

/***
   * Converts a dataUrl base64 image string into a File byte array
   * dataUrl example:
   * data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIsAAACLCAYAAABRGWr/AAAAAXNSR0IA...etc
***/
 export function dataUrlToFile(dataUrl: string, filename: string): File | null {
  const arr = dataUrl.split(',');
  if (arr.length < 2) { return null; }
  const mimeArr = arr[0].match(/:(.*?);/);
  if (!mimeArr || mimeArr.length < 2) { return null; }
  const mime = mimeArr[1];
  const buff = Buffer.from(arr[1], 'base64');
  return new File([buff], filename, {type:mime});
}

export function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export function handleBase64Error(error: any) {
  console.log('base64Error ', error);
  return null;
}

export function downloadFile({data, filename, type}: {data: Blob, filename: string, type: string}) {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function parseJSON(string: string) {
  try {
    return JSON.parse(string);
  } catch (e) {
    return null;
  }
}

export function getFromLocalStorage({key, parse}: {key: string, parse?: boolean}) {
  try {
    const value = localStorage.getItem(key);
    if (parse) {
      return JSON.parse(value);
    }
    return value;
  } catch (error) {
    return null;
  }
}

export function convertCsvLineToArray({ csv = '', separator = ',', trim = true, returnStringIfOnlyOne = true }) {
  const values = csv?.split(separator).map((v) => (trim ? v.trim() : v)).filter(Boolean);

  if (returnStringIfOnlyOne && values?.length === 1) {
    return values[0];
  }

  return values?.length ? values : null;
}
