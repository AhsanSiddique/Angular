import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormGroupInput } from '../../base-classes';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageCropperConfig } from '../image-croppper/image-croppper.component';

@Component({
  selector: 'fan-id-upload-document-form-local',
  templateUrl: './upload-document-form-local.component.html',
  styleUrls: ['./upload-document-form-local.component.scss']
})
export class UploadDocumentFormLocalComponent extends FormGroupInput implements OnInit, OnDestroy {
  @Input() application_type: FormControl;
  @Input() isServiceCentre?: boolean;

  @Input() disable_form?: boolean;

  @Output() formSubmit = new EventEmitter();
  scannedImage: string;
  constructor(public sanitizer: DomSanitizer) {
    super();
  }
  user_image_src: any;
  show_upload_photo_modal = false;
  showCropper=false;
  doc_front_selected = false;
  doc_front_name = '';

  document_front_label = 'Document'
  showConnectionMessagge:boolean;
  private readonly unsubscribe$ = new Subject<void>();
  public socket = new WebSocket('ws://localhost:8200');
  user_image_to_crop: string;
  user_image_cropper_config: ImageCropperConfig = {
    maintainAspectRatio: true,
    aspectRatio: 3/4
  }
  ngOnInit() {
    this.initializeWebSocket();

    // this.application_type.valueChanges
    // .pipe(takeUntil(this.unsubscribe$))
    // .subscribe(val => {
    //   if(!val) {
    //     this.document_front_label = 'Document'
    //   } else if (val !== 'QRC') {
    //     this.document_front_label = 'Passport'
    //   } else {
    //     this.document_front_label = "QID"
    //   }
    // })

    this.document_type.valueChanges
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(val => {
      if(!val) {
        this.document_front_label = 'Document'
      } else if (val === 3) {
        this.document_front_label = 'Passport'
      } else {
        this.document_front_label = "QID"
      }
    })
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }



  initializeWebSocket() {
    this.socket = new WebSocket('ws://localhost:8200');

    this.socket.onerror = () => {
      this.socket.close();
    };
    this.socket.onmessage = (message) => {
      console.log("read obnject",message)

      const objectUrl = URL.createObjectURL(message.data);
      this.scannedImage=objectUrl
      this.showCropper=true;

    };
  }
  scanImage(type: any) {
    if (
      (this.socket.readyState ===WebSocket.CONNECTING)||
      (this.socket.readyState ===WebSocket.CLOSED)||
      (this.socket.readyState ===WebSocket.CLOSING)
    ) {
      const link = document.createElement('a');
      link.setAttribute('type', 'hidden');
      link.href = 'assets/scanner/FanIdScannerInterface.exe';
      link.download = 'FanIdScannerInterface.exe';
      document.body.appendChild(link);
      link.click();
      link.remove();
      this.socket.close();
      this.showConnectionMessagge=true;
    }else{
      this.scan();
    }
  }
  scan() {
    this.socket.send('scanImg');
  }
  get uf() {
    return this.formGroup.controls;
  }

  get document_type() {
    return this.uf.document_type;
  }

  onUploadUserImageClick(event) {
    if (this.isServiceCentre && !this.disable_form) {
      event.preventDefault();
      this.show_upload_photo_modal = true;
    }
  }

  closeUploadPhotoModal() {
    this.show_upload_photo_modal = false;
  }
  initializeWebSocketandScan(){
    this.socket = new WebSocket('ws://localhost:8200');
    this.socket.onopen=()=>{
      this.scanImage('1');
    };
    this.socket.onerror = () => {
      this.socket.close();
    };
    this.socket.onmessage = (message) => {
      console.log("read obnject",message)

      const objectUrl = URL.createObjectURL(message.data);
      this.scannedImage=objectUrl
      this.showCropper=true;
    };
  }
  closeCommonDialog(){
    this.initializeWebSocketandScan();

    this.showConnectionMessagge = false;


  }
  //#region file select handlers
  onUserImageChange(event) {
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [image]: [File] = event.target.files;
      const { image_valid, image_error } = this.validateImageSize({ image });

      if (!image_valid) {
        window.alert(image_error);
        return;
      }
      this.formGroup.patchValue({
        user_image: image,
      });
      reader.readAsDataURL(image);

      reader.onload = () => {
        this.user_image_src = reader.result as string;
        this.user_image_to_crop = this.user_image_src;
        this.formGroup.patchValue({
          user_image_src: reader.result,
        });
      };
    }

    this.show_upload_photo_modal = false;
  }

  onDocFrontChange(event) {
    event.stopPropagation();

    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [image]: [File] = event.target.files;
      const { image_valid, image_error } = this.validateImageSize({ image });

      if (!image_valid) {
        window.alert(image_error);
        return;
      }
      this.formGroup.patchValue({
        document_front: image,
      });
      this.doc_front_selected = true;
      this.doc_front_name = image.name;

      reader.readAsDataURL(image);

      reader.onload = () => {
        this.formGroup.patchValue({
          document_front_src: (reader.result as string).split(',')[1],
        });
      };
    }
  }

  //#endregion file select handlers

  validateImageSize({
    image,
    max_size_mb = 5,
  }: {
    image: File | Blob;
    max_size_mb?: number;
  }) {
    console.log({ imagesize: image?.size });
    const MAX_SIZE = max_size_mb * 1024 * 1024;

    const image_size = image?.size || 0;
    const image_valid = image_size <= MAX_SIZE;
    const image_error = `Maximum upload size is ${max_size_mb} MB`;

    return { image_valid, image_error };
  }

  resetDocFront() {
    this.doc_front_selected = false;
    this.doc_front_name = '';
    this.uf.document_front.reset();
    this.uf.document_front_src.reset();
    this.uf.document_front.enable();
  }

  resetDoc(event) {
    event.preventDefault();
    this.resetDocFront();
  }

  uploadDocument() {
    this.formSubmit.emit();
  }
  storeImageandClose(event){
    this.scannedImage=event;
    this.showCropper=false;

      this.formGroup.patchValue({
        document_front: this.scannedImage,
      });
      this.doc_front_selected = true;
      this.doc_front_name = "scannedImage.jpeg";

        this.formGroup.patchValue({
          document_front_src: this.scannedImage
        });
    }
       saveCroppedUserImage(image:Blob) {
           // console.log({ image })
           this.user_image_to_crop = null;
           const reader = new FileReader();

           const { image_valid, image_error } = this.validateImageSize({ image });

           if (!image_valid) {
             window.alert(image_error);
             return;
           }
           this.formGroup.patchValue({
             user_image: new File([image], 'user_image.jpg')
           });
           reader.readAsDataURL(image);

           reader.onload = () => {
             this.user_image_src = reader.result as string;
             this.formGroup.patchValue({
               user_image_src: reader.result,
             });
           };
         }
}

