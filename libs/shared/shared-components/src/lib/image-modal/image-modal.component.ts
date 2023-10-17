import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'fan-id-image-modal',
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.scss']
})
export class ImageModalComponent {
  @Input() imageSrc: string;
  @Input() imageConfig = {
    aspectRatio: '8x5',
    zoomEnabled: true,
  }
  @Output() closeThis = new EventEmitter();
  image_scale = 1;
  image_rotate = 0;
  image_transform_origin = 'center';

  zoomIn() {
    this.image_scale += 0.075;
  }

  zoomOut() {
    if (this.image_scale < 0.03) return;
    this.image_scale -= 0.075;
  }

  rotateClockWise() {
    this.image_rotate += 90;
  }

  rotateAntiClockWise() {
    this.image_rotate -= 90;
  }
}
