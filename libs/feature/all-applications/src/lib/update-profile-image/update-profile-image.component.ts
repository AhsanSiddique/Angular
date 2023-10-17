import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BulkRegistrationService } from '@fan-id/api/server';
import { CoreService } from '@fan-id/core';
import { ImageCropperConfig } from 'libs/shared/shared-forms/src/lib/form-manual-components/image-croppper/image-croppper.component';

@Component({
  selector: 'fan-id-update-profile-image',
  templateUrl: './update-profile-image.component.html',
  styleUrls: ['./update-profile-image.component.scss'],
})
export class UpdateProfileImageComponent implements OnInit {
  @Output() closeThis = new EventEmitter();
  @Input() data: any;
  @Output() submitData = new EventEmitter<any>();
  updateProfileImageForm: FormGroup;
  incomingPropic: string;
  user_image_src: any;
  user_image_to_crop: string;
  user_image_cropper_config: ImageCropperConfig = {
    maintainAspectRatio: true,
    aspectRatio: 3 / 4,
  };
  applicationId: number;
  constructor(
    private fb: FormBuilder,
    private bulkuploadService: BulkRegistrationService,
    private coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.incomingPropic = this.data.profilePic;
    this.applicationId = this.data.id;
    this.updateProfileImageForm = this.fb.group({
      profilePic: [],
      user_image_src: [null],
      user_image: [null],
    });
  }

  getImage(imagePath) {
    return this.bulkuploadService.getImage(imagePath);
  }
  Upload() {
    const body = {
      ApplicatioId: this.applicationId,
      ProfilePic: this.updateProfileImageForm.controls.user_image?.value,
    };
    this.submitData.emit(body);
  }

  onUserImageChange(event) {
    if (event.target.files && event.target.files.length) {
      const [image]: [File] = event.target.files;
      if (!image.type.startsWith('image/jpeg')) {
        window.alert('Please upload a jpg/jpeg file');
        return;
      }
      const { image_valid, image_error } = this.validateImageSize({ image });
      if (!image_valid) {
        window.alert(image_error);
        return;
      }
      this.updateProfileImageForm.patchValue({
        profilePic: image,
      });
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = () => {
        this.user_image_src = reader.result as string;
        this.user_image_to_crop = this.user_image_src;
        this.updateProfileImageForm.patchValue({
          user_image_src: reader.result,
        });
      };
    }
  }

  validateImageSize({
    image,
    max_size_mb = 2,
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

  saveCroppedUserImage(image: Blob) {
    this.user_image_to_crop = null;
    const { image_valid, image_error } = this.validateImageSize({ image });

    if (!image_valid) {
      window.alert(image_error);
      return;
    }

    this.updateProfileImageForm.patchValue({
      user_image: new File([image], 'user_image.jpg'),
    });
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = () => {
      this.user_image_src = reader.result as string;
      this.updateProfileImageForm.patchValue({
        user_image_src: reader.result,
      });
    };
  }
}
