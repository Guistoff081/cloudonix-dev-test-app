import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../shared/product.model';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { ProductPropertyEditorComponent } from '../product-property-editor/product-property-editor.component';

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
    MatDialogModule,
    ProductPropertyEditorComponent,
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
})
export class ProductComponent implements OnInit {
  productForm!: FormGroup;
  isEditMode = false;
  isViewMode = false;
  isCreateMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { product: Product; mode: 'view' | 'edit' | 'create' }
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data.product && this.data.mode === 'edit';
    this.isCreateMode = this.data.mode === 'create';
    this.isViewMode = this.data.mode === 'view';

    this.productForm = this.fb.group({
      name: [
        { value: '', disabled: this.isViewMode },
        [Validators.required, Validators.maxLength(50)],
      ],
      description: [
        { value: '', disabled: this.isViewMode },
        [Validators.required, Validators.maxLength(200)],
      ],
      sku: [
        { value: '', disabled: this.isViewMode || this.isEditMode },
        [Validators.required, Validators.maxLength(20)],
      ],
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

    if (this.isEditMode || this.isViewMode) {
      console.log('product Formb', this.productForm.value);
      this.productForm.patchValue(this.data.product);
      console.log('product Forma', this.productForm.value);
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      console.log('product Form', this.productForm.value);
      const formValue = this.productForm.value;
      const product: Product = {
        ...formValue,
        // Ensure profile is properly included
        profile: {
          ...formValue.profile,
        },
      };
      this.dialogRef.close({ product, isEditMode: this.isEditMode });
    }
  }

  onPropertiesChange(updatedProfile: any) {
    const profileControl = this.productForm.get('profile');
    if (profileControl) {
      profileControl.patchValue(updatedProfile);
    }
  }
}
