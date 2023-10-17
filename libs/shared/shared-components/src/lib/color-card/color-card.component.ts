import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

// type TColorCardType = 'beige' | 'red' | 'yellow' | 'purple' | 'teal';

@Component({
  selector: 'fan-id-color-card',
  templateUrl: './color-card.component.html',
  styleUrls: ['./color-card.component.scss']
})
export class ColorCardComponent implements AfterViewInit {
  @Input() bgColor: string;
  @Input() titleText: string;
  @Input() svg?: string;
  @Output() buttonClick: EventEmitter<void> = new EventEmitter();

  @ViewChild('svgContainer') svgContainer: ElementRef;

  ngAfterViewInit() {
    if (this.svg) {
      this.svgContainer.nativeElement.innerHTML = this.svg;
    }
  }
}
