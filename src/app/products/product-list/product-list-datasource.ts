import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map, tap, catchError, finalize } from 'rxjs/operators';
import { Observable, BehaviorSubject, merge, throwError } from 'rxjs';
import { Product } from '../shared/product.model';
import { ProductService } from '../shared/product.service';

/**
 * Data source for the ProductList view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class ProductListDataSource extends DataSource<Product> {
  data: Product[] = [];
  paginator: MatPaginator | undefined;
  sort: MatSort | undefined;
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  public setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  constructor(private productService: ProductService) {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<Product[]> {
    if (this.paginator && this.sort) {
      // Combine everything that affects the rendered data into one update
      // stream for the data-table to consume.
      return merge(
        this.productsSubject,
        this.paginator.page,
        this.sort.sortChange
      ).pipe(
        map(() => {
          return this.getPagedData(
            this.getSortedData([...this.productsSubject.value])
          );
        })
      );
    } else {
      throw Error(
        'Please set the paginator and sort on the data source before connecting.'
      );
    }
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect(): void {
    this.productsSubject.complete();
    this.loadingSubject.complete();
  }

  loadProducts() {
    this.loadingSubject.next(true);
    return this.productService.getProducts().pipe(
      tap((products) => {
        this.data = products;
        this.productsSubject.next(products);
      }),
      catchError((error) => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: Product[]): Product[] {
    if (this.paginator) {
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      return [...data].slice(startIndex, startIndex + this.paginator.pageSize);
    }
    return data;
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: Product[]): Product[] {
    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort?.direction === 'asc';
      switch (this.sort?.active) {
        case 'id':
          return compare(+a.id!, +b.id!, isAsc);
        case 'name':
          return compare(a.name, b.name, isAsc);
        case 'sku':
          return compare(a.sku, b.sku, isAsc);
        case 'cost':
          return compare(a.cost, b.cost, isAsc);
        default:
          return 0;
      }
    });
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(
  a: string | number,
  b: string | number,
  isAsc: boolean
): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
