import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-property-editor',
  imports: [MatIconModule, MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './product-property-editor.component.html',
  styleUrl: './product-property-editor.component.scss'
})

export class ProductPropertyEditorComponent implements OnInit {
  @Input() initialProperties: { [key: string]: any } = {};
  @Output() propertiesChanged = new EventEmitter<{ [key: string]: string }>();

  productPropertyForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.productPropertyForm = this.fb.group({
      properties: this.fb.array([])
    });
  }

  ngOnInit() {
    const properties = this.productPropertyForm.get('properties') as FormArray;

    // Initialize with existing properties
    Object.entries(this.initialProperties)
      .filter(([key]) => !['type', 'available', 'backlog'].includes(key))
      .forEach(([key, value]) => {
        properties.push(this.createPropertyGroup(key, value));
      });

    // Subscribe to form changes
    this.productPropertyForm.valueChanges.subscribe(() => {
      this.emitProperties();
    });
  }

  get properties() {
    return this.productPropertyForm.get('properties') as FormArray;
  }

  createPropertyGroup(key: string = '', value: string = ''): FormGroup {
    return this.fb.group({
      key: [key, Validators.required],
      value: [value, Validators.required]
    });
  }

  addProperty(): void {
    this.properties.push(this.createPropertyGroup());
  }

  removeProperty(index: number): void {
    this.properties.removeAt(index);
  }

  private emitProperties(): void {
    const customProperties: { [key: string]: string } = {};

    this.properties.controls.forEach(control => {
      const { key, value } = control.value;
      if (key && value) {
        customProperties[key] = value;
      }
    });

    this.propertiesChanged.emit(customProperties);
  }
}
