import { Component, Input, OnInit } from '@angular/core';
import { K8sResourceEditorService } from '../services/k8s-resource-editor.service';
import * as JSONEditor from 'jsoneditor';

@Component({
  selector: 'app-json-editor',
  templateUrl: './json-editor.component.html',
  styleUrls: ['./json-editor.component.scss']
})
export class JsonEditorComponent implements OnInit {
  @Input() resourceData: any;
  private editor: any;

  constructor(private k8sResourceEditorService: K8sResourceEditorService) {}

  ngOnInit() {
    const container = document.getElementById('jsoneditor');
    const options = {
      escapeUnicode: false,
      history: true,
      indentation: 2,
      mode: 'code',
      search: true,
      sortObjectKeys: false,
      modes: ['code', 'tree', 'view', 'form']
    };
    this.editor = new JSONEditor(container, options, this.resourceData);
  }

  updateYaml() {
    const newData = this.editor.get();

    return this.k8sResourceEditorService.updateResource(newData);
  }
}
