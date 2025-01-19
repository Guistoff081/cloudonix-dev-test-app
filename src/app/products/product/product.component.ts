import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../shared/product.model';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-product',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
})
export class ProductComponent implements OnInit {
  productForm!: FormGroup;
  isEditMode = false;
  isViewMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { product: Product; viewMode: boolean }
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data.product;
    this.isViewMode = this.data.viewMode;

    this.productForm = this.fb.group({
      name: [{ value: '', disabled: this.isViewMode }, Validators.required],
      description: [{ value: '', disabled: this.isViewMode }],
      sku: [{ value: '', disabled: this.isViewMode }, Validators.required],
      cost: [
        { value: 0, disabled: this.isViewMode },
        [Validators.required, Validators.min(0)],
      ],
      profile: this.fb.group({
        type: [{ value: 'furniture', disabled: this.isViewMode }],
        available: [{ value: true, disabled: this.isViewMode }],
        backlog: [{ value: 0, disabled: this.isViewMode }],
      }),
      customProperties: this.fb.array([]),
    });

    if (this.isEditMode) {
      this.productForm.patchValue(this.data.product);
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const product: Product = this.productForm.value;
      this.dialogRef.close({ product, isEditMode: this.isEditMode });
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  addCustomProperty(): void {
    const customProperties = this.productForm.get(
      'customProperties'
    ) as FormArray;
    customProperties.push(
      this.fb.group({
        key: ['', Validators.required],
        value: ['', Validators.required],
      })
    );
  }

  removeCustomProperty(index: number): void {
    const customProperties = this.productForm.get(
      'customProperties'
    ) as FormArray;
    customProperties.removeAt(index);
  }

  get customPropertiesControls() {
    return (this.productForm.get('customProperties') as FormArray).controls;
  }
}
