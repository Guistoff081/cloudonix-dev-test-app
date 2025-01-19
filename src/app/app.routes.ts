import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ProductListComponent } from './products/product-list/product-list.component';
import { AuthGuard } from '@core/auth.guard';

export const routes: Routes = [
    { path: "login", component: LoginComponent },
    { path: "products", component: ProductListComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
];
