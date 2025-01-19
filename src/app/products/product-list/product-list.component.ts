import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { ProductListDataSource } from './product-list-datasource';
import { ProductComponent } from '../product/product.component';
import { Product } from '../shared/product.model';
import { ProductService } from '../shared/product.service';
import { ConfirmDialogComponent } from '@shared/confirm-dialog/confirm-dialog.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class ProductListComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Product>;
  dataSource: ProductListDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'sku', 'name', 'cost', 'actions'];

  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new ProductListDataSource(this.productService);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
    this.loadProducts();
  }

  loadProducts(): void {
    this.dataSource.loadProducts();
  }

  confirmDelete(product: Product): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete ${product.name}?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && product.id) {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.loadProducts();
            this.snackBar.open('Product deleted successfully', 'Close', {
              duration: 3000,
            });
          },
          error: () => {
            this.snackBar.open('Error deleting product', 'Close', {
              duration: 3000,
            });
          },
        });
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProductComponent, {
      width: '600px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.productService.createProduct(result.product);
        this.loadProducts();
      }
    });
  }

  viewProduct(product: Product): void {
    const dialogRef = this.dialog.open(ProductComponent, {
      width: '600px',
      data: { product, viewMode: true },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  editProduct(product: Product): void {
    const dialogRef = this.dialog.open(ProductComponent, {
      width: '600px',
      data: { product, viewMode: false },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updatedProduct = result.product;
        const index = this.dataSource.data.findIndex(
          (p) => p.id === updatedProduct.id
        );
        if (index !== -1) {
          this.dataSource.data[index] = updatedProduct;
          this.productService.updateProduct(updatedProduct.id, updatedProduct);
        }
      }
    });
  }
}
