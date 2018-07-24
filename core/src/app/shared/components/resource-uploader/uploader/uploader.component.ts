import { Component } from '@angular/core';
import { ResourceUploadService } from '../services/resource-upload.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss']
})
export class UploaderComponent {
  public err = false;
  public fileToUpload: any;
  public fileName = '';
  public fileContents: string[] = [];
  public ready = false;

  constructor(private resourceUploadService: ResourceUploadService) {}

  public upload() {
    return this.resourceUploadService.uploadWorkaround(this.fileContents);
  }

  private isFileReadyToUpload() {
    return this.ready;
  }

  public selectFile(files: any) {
    if (!_.isUndefined(files.target.files[0])) {
      this.fileToUpload = files.target.files[0];
      this.fileName = this.fileToUpload.name;

      this.resourceUploadService.getFileContent(this.fileToUpload).subscribe(
        data => {
          this.fileContents = data;
          this.err = false;
          this.ready = true;
        },
        error => {
          this.err = error;
          this.ready = false;
        }
      );
    }
  }
}
