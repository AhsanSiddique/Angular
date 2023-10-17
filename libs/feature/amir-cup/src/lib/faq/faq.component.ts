import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'fan-id-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})

export class FaqComponent implements OnInit {

accord1:boolean =true;
accord2:boolean =false;
accord3:boolean =false;
accord4:boolean =false;
accord5:boolean =false;
accord6:boolean =false;
accord7:boolean =false;
accord8:boolean =false;
accord9:boolean =false;
accord10:boolean =false;
accord11:boolean =false;
accord12:boolean =false;
accord13:boolean =false;
accord14:boolean =false;
accord15:boolean =false;
accord16:boolean =false;

generalFaqBoolean:boolean = true;
stadiumAccessFaqBoolean:boolean = false;
metroFaqBoolean:boolean = false;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  accordFivePlusMinus(plusOrMinus:string,id:number): void {
    if(plusOrMinus =='plus'){
      if(id == 1){
        this.accord1 = true;this.accord2 = false;this.accord3 = false;this.accord4 = false;this.accord5 = false;
        this.accord6 = false;this.accord7 = false;this.accord8 = false;this.accord9 = false;this.accord10 = false;
        this.accord11 = false;this.accord12 = false;this.accord13 = false;this.accord14 = false;this.accord15 = false;this.accord16 = false;
      }
      if(id == 2){
        this.accord1 = false;this.accord2 = true;this.accord3 = false;this.accord4 = false;this.accord5 = false;
        this.accord6 = false;this.accord7 = false;this.accord8 = false;this.accord9 = false;this.accord10 = false;
        this.accord11 = false;this.accord12 = false;this.accord13 = false;this.accord14 = false;this.accord15 = false;this.accord16 = false;
      }
      if(id == 3){
        this.accord1 = false; this.accord2 = false;this.accord3 = true; this.accord4 = false;this.accord5 = false;
        this.accord6 = false;this.accord7 = false;this.accord8 = false;this.accord9 = false;this.accord10 = false;
        this.accord11 = false;this.accord12 = false;this.accord13 = false;this.accord14 = false;this.accord15 = false;this.accord16 = false;
      }
      if(id == 4){
        this.accord1 = false;this.accord2 = false; this.accord3 = false; this.accord4 = true; this.accord5 = false;
        this.accord6 = false;this.accord7 = false;this.accord8 = false;this.accord9 = false;this.accord10 = false;
        this.accord11 = false;this.accord12 = false;this.accord13 = false;this.accord14 = false;this.accord15 = false;this.accord16 = false;
      }
      if(id == 5){
        this.accord1 = false;this.accord2 = false; this.accord3 = false;  this.accord4 = false; this.accord5 = true;
        this.accord6 = false;this.accord7 = false;this.accord8 = false;this.accord9 = false;this.accord10 = false;
        this.accord11 = false;this.accord12 = false;this.accord13 = false;this.accord14 = false;this.accord15 = false;this.accord16 = false;
      }
      if(id == 6){
        this.accord1 = false;this.accord2 = false; this.accord3 = false;  this.accord4 = false; this.accord5 = false;
        this.accord6 = true;this.accord7 = false;this.accord8 = false;this.accord9 = false;this.accord10 = false;
        this.accord11 = false;this.accord12 = false;this.accord13 = false;this.accord14 = false;this.accord15 = false;this.accord16 = false;
      }
      if(id == 7){
        this.accord1 = false;this.accord2 = false; this.accord3 = false;  this.accord4 = false; this.accord5 = false;
        this.accord6 = false;this.accord7 = true;this.accord8 = false;this.accord9 = false;this.accord10 = false;
        this.accord11 = false;this.accord12 = false;this.accord13 = false;this.accord14 = false;this.accord15 = false;this.accord16 = false;
      }
      if(id == 8){
        this.accord1 = false;this.accord2 = false; this.accord3 = false;  this.accord4 = false; this.accord5 = false;
        this.accord6 = false;this.accord7 = false;this.accord8 = true;this.accord9 = false;this.accord10 = false;
        this.accord11 = false;this.accord12 = false;this.accord13 = false;this.accord14 = false;this.accord15 = false;this.accord16 = false;
      }
      if(id == 9){
        this.accord1 = false;this.accord2 = false; this.accord3 = false;  this.accord4 = false; this.accord5 = false;
        this.accord6 = false;this.accord7 = false;this.accord8 = false;this.accord9 = true;this.accord10 = false;
        this.accord11 = false;this.accord12 = false;this.accord13 = false;this.accord14 = false;this.accord15 = false;this.accord16 = false;
      }
      if(id == 10){
        this.accord1 = false;this.accord2 = false; this.accord3 = false;  this.accord4 = false; this.accord5 = false;
        this.accord6 = false;this.accord7 = false;this.accord8 = false;this.accord9 = false;this.accord10 = true;
        this.accord11 = false;this.accord12 = false;this.accord13 = false;this.accord14 = false;this.accord15 = false;this.accord16 = false;
      }
      if(id == 11){
        this.accord1 = false;this.accord2 = false; this.accord3 = false;  this.accord4 = false; this.accord5 = false;
        this.accord6 = false;this.accord7 = false;this.accord8 = false;this.accord9 = false;this.accord10 = false;
        this.accord11 = true;this.accord12 = false;this.accord13 = false;this.accord14 = false;this.accord15 = false;this.accord16 = false;
      }
      if(id == 12){
        this.accord1 = false;this.accord2 = false; this.accord3 = false;  this.accord4 = false; this.accord5 = false;
        this.accord6 = false;this.accord7 = false;this.accord8 = false;this.accord9 = false;this.accord10 = false;
        this.accord11 = false;this.accord12 = true;this.accord13 = false;this.accord14 = false;this.accord15 = false;this.accord16 = false;
      }
      if(id == 13){
        this.accord1 = false;this.accord2 = false; this.accord3 = false;  this.accord4 = false; this.accord5 = false;
        this.accord6 = false;this.accord7 = false;this.accord8 = false;this.accord9 = false;this.accord10 = false;
        this.accord11 = false;this.accord12 = false;this.accord13 = true;this.accord14 = false;this.accord15 = false;this.accord16 = false;
      }
      if(id == 14){
        this.accord1 = false;this.accord2 = false; this.accord3 = false;  this.accord4 = false; this.accord5 = false;
        this.accord6 = false;this.accord7 = false;this.accord8 = false;this.accord9 = false;this.accord10 = false;
        this.accord11 = false;this.accord12 = false;this.accord13 = false;this.accord14 = true;this.accord15 = false;this.accord16 = false;
      }
      if(id == 15){
        this.accord1 = false;this.accord2 = false; this.accord3 = false;  this.accord4 = false; this.accord5 = false;
        this.accord6 = false;this.accord7 = false;this.accord8 = false;this.accord9 = false;this.accord10 = false;
        this.accord11 = false;this.accord12 = false;this.accord13 = false;this.accord14 = false;this.accord15 = true;this.accord16 = false;
      }
      if(id == 16){
        this.accord1 = false;this.accord2 = false; this.accord3 = false;  this.accord4 = false; this.accord5 = false;
        this.accord6 = false;this.accord7 = false;this.accord8 = false;this.accord9 = false;this.accord10 = false;
        this.accord11 = false;this.accord12 = false;this.accord13 = false;this.accord14 = false;this.accord15 = false;this.accord16 = true;
      }
    }
    else{
      this.accord1 = false; this.accord2 = false; this.accord3 = false; this.accord4 = false; this.accord5 = false;
      this.accord6 = false;this.accord7 = false;this.accord8 = false;this.accord9 = false;this.accord10 = false;
      this.accord11 = false;this.accord12 = false;this.accord13 = false;this.accord14 = false;this.accord15 = false;this.accord16 = false;
    }
  }

  changeSelectClass(id: number): void {
    if(id==1){
      this.generalFaqBoolean = true; this.metroFaqBoolean = false; this.stadiumAccessFaqBoolean = false;
      this.accordFivePlusMinus('plus', 1)
    }
    if(id==2){
      this.generalFaqBoolean = false; this.metroFaqBoolean = false; this.stadiumAccessFaqBoolean = true
      this.accordFivePlusMinus('plus', 13)
    }
    if(id==3){
      this.generalFaqBoolean = false; this.metroFaqBoolean = true; this.stadiumAccessFaqBoolean = false
      this.accordFivePlusMinus('plus', 15)
    }

  }

  redirectToContactUs(): void {
    this.router.navigateByUrl("/home?fragment=footer");
  }

}
