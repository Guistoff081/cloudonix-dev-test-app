import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil, catchError } from 'rxjs/operators';
import { Subject, EMPTY, merge } from 'rxjs';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatProgressSpinnerModule,
  ],
})
export class ProductListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Product>;
  dataSource: ProductListDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'sku', 'name', 'cost', 'actions'];

  private destroy$ = new Subject<void>();
  isLoading = false;
  error: string | null = null;

  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new ProductListDataSource(this.productService);
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(): void {
    this.error = null;

    this.dataSource
      .loadProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.paginator.length = products.length;
        },
        error: (error) => {
          this.error = 'Failed to load products. Please try again.';
          this.snackBar.open(this.error, 'Close', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        },
      });
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
        this.dataSource.setLoading(true);

        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.loadProducts();
            this.snackBar.open('Product deleted successfully', 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
          },
          error: () => {
            this.dataSource.setLoading(false);
            this.snackBar.open('Error deleting product', 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
          },
        });
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProductComponent, {
      width: '600px',
      data: { mode: 'create' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dataSource.setLoading(true);
        this.productService.createProduct(result.product).subscribe({
          next: () => {
            this.loadProducts();
          },
          error: () => {
            this.snackBar.open('Error creating product', 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
            this.dataSource.setLoading(false);
          },
        });
      }
    });
  }

  viewProduct(product: Product): void {
    const dialogRef = this.dialog.open(ProductComponent, {
      width: '600px',
      data: { product, mode: 'view' },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  editProduct(product: Partial<Product>): void {
    const dialogRef = this.dialog.open(ProductComponent, {
      width: '600px',
      data: { product: { ...product }, mode: 'edit' },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result?.product) {
          this.dataSource.setLoading(true);
          const updatedProduct = result.product;
          this.productService
            .updateProduct(product.id!, updatedProduct)
            .pipe(
              catchError((error) => {
                this.snackBar.open('Failed to update product', 'Close', {
                  duration: 3000,
                  horizontalPosition: 'right',
                  verticalPosition: 'top',
                });
                this.dataSource.setLoading(false);
                return EMPTY;
              })
            )
            .subscribe(() => {
              this.loadProducts();
              this.snackBar.open('Product updated successfully', 'Close', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
              });
            });
        }
      });
  }
}
