import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { base64ToFile, ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';

export interface ImageCropperConfig {
  maintainAspectRatio: boolean
  aspectRatio: number
}
@Component({
  selector: 'fan-id-image-croppper',
  templateUrl: './image-croppper.component.html',
  styleUrls: ['./image-croppper.component.scss']
})
export class ImageCroppperComponent implements OnInit {

  @Input() ImagePath = '';
  @Input() config: ImageCropperConfig = {
    maintainAspectRatio: true,
    aspectRatio: 1
  };
  @Output() closeThis = new EventEmitter();
  imageChangedEvent: any = '';
  croppedImage: any = '';
  cropperFile:any;
  scale = 1
  transform: ImageTransform = {}

  ngOnInit(): void {
    console.log({ ImagePath: this.ImagePath })
  }

  fileChangeEvent(event: any): void {
      this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    this.cropperFile = base64ToFile(this.croppedImage);
  }
  // imageLoaded(image: LoadedImage) {
  //     // show cropper
  // }
  cropperReady() {
      // cropper ready
  }
  loadImageFailed() {
      // show message
  }
  closeCropper(){
    this.closeThis.emit(this.cropperFile)
  }

  zoomOut() {
    this.scale -= .1;
    this.transform = {
      ...this.transform,
      scale: this.scale
    };
  }

  zoomIn() {
    this.scale += .1;
    this.transform = {
      ...this.transform,
      scale: this.scale
    };
  }
}
