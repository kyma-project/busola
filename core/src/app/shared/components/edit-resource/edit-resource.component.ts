import { Component, Input } from '@angular/core';
import { JsonEditorModalComponent } from '../json-editor-modal/json-editor-modal.component';

@Component({
  selector: 'app-edit-resource',
  templateUrl: './edit-resource.component.html',
  styleUrls: ['./edit-resource.component.scss'],
  host: {'class': 'json-editor'}
})
export class EditResourceComponent {
  @Input() resourceData: any;
  constructor() { }

  showJsonEditorModal(jsonEditorModalComponent: JsonEditorModalComponent) {
    jsonEditorModalComponent.show();
  }
}
