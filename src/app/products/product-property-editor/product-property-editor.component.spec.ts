import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPropertyEditorComponent } from './product-property-editor.component';

describe('ProductPropertyEditorComponent', () => {
  let component: ProductPropertyEditorComponent;
  let fixture: ComponentFixture<ProductPropertyEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductPropertyEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductPropertyEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
