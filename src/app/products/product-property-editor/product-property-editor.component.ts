import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

interface PropertyItem {
  key: string;
  value: string;
  isEditing: boolean;
}
@Component({
  selector: 'app-product-property-editor',
  imports: [
    CommonModule,
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './product-property-editor.component.html',
  styleUrl: './product-property-editor.component.scss',
})
export class ProductPropertyEditorComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Input() isViewMode = false;
  @Output() propertiesChange = new EventEmitter<{[key: string]: any}>();

  properties: PropertyItem[] = [];
  newPropertyForm: FormGroup;
  protected readonly defaultKeys = ['type', 'available', 'backlog'];

  constructor(private fb: FormBuilder) {
    this.newPropertyForm = this.fb.group({
      newKey: [''],
      newValue: [''],
    });
  }

  ngOnInit() {
    // Initialize properties from parent form's profile
    const profile = this.parentForm.get('profile')?.value || {};
    this.properties = Object.entries(profile)
      .filter(([key]) => !this.defaultKeys.includes(key))
      .map(([key, value]) => ({
        key,
        value: value as string,
        isEditing: false,
      }));
  }

  addProperty() {
    const { newKey, newValue } = this.newPropertyForm.value;

    if (newKey && newValue && !this.properties.some((p) => p.key === newKey)) {
      this.properties.push({
        key: newKey,
        value: newValue,
        isEditing: false,
      });

      const profileControl = this.parentForm.get('profile');
      if (profileControl) {
        const currentValue = profileControl.value || {};
        profileControl.patchValue({
          ...currentValue,
          [newKey]: newValue,
        });
      }

      this.newPropertyForm.reset();
    }
  }

  removeProperty(prop: PropertyItem) {
    this.properties = this.properties.filter((p) => p.key !== prop.key);

    const profileControl = this.parentForm.get('profile');
    if (profileControl) {
      const currentValue = { ...profileControl.value };
      delete currentValue[prop.key];
      profileControl.patchValue(currentValue);
    }
  }

  toggleEdit(prop: PropertyItem) {
    prop.isEditing = !prop.isEditing;
    if (!prop.isEditing) {
      const profileControl = this.parentForm.get('profile');
      if (profileControl) {
        const currentValue = profileControl.value || {};
        profileControl.patchValue({
          ...currentValue,
          [prop.key]: prop.value,
        });
      }
    }
  }

  onValueBlur(prop: PropertyItem) {
    if (prop.isEditing) {
      const profileControl = this.parentForm.get('profile');
      if (profileControl) {
        const currentValue = profileControl.value || {};
        profileControl.patchValue({
          ...currentValue,
          [prop.key]: prop.value,
        });
      }
    }
  }
}
