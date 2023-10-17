import { Injectable } from '@nestjs/common';
// import { json } from 'express';
// import { join } from 'node:path';
import * as fs from 'fs'
import { join } from 'path';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Dummy Api Works!';
  }

  loadData(fileName:string){
    const path=join(__dirname,'..',`./assets/data/${fileName}.json`)
    const data=fs.readFileSync(path,'utf8');
    return JSON.parse(data)
  }
}
