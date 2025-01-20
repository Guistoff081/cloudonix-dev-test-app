import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AuthService } from '@core/auth.service';
@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, LayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'cloudonix-dev-test-app';
  isAuthenticated$: Observable<boolean>;
  constructor(private authService: AuthService) {
    this.isAuthenticated$ = this.authService.isLoggedIn();
    this.isAuthenticated$.subscribe((isAuthenticated) => {
      console.log('isAuthenticated', isAuthenticated);
    });
  }
}
