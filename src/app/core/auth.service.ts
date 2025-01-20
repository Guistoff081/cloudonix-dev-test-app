import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authToken = new BehaviorSubject<string>(this.getTokenFromStorage());
  private isAuthenticated = new BehaviorSubject<boolean>(this.isTokenPresent());

  constructor() {
    this.checkInitialAuthState();
  }

  setToken(token: string): void {
    this.authToken.next(token);
    localStorage.setItem('authKey', token);
    this.isAuthenticated.next(true);
  }

  getToken(): string | null {
    return this.authToken.value || localStorage.getItem('authKey');
  }

  logout(): void {
    this.authToken.next('');
    localStorage.removeItem('authKey');
    this.isAuthenticated.next(false);
  }

  isLoggedIn(): Observable<boolean> {
    return this.isAuthenticated.asObservable();
  }

  private getTokenFromStorage(): string {
    return localStorage.getItem('authKey') || '';
  }
  private isTokenPresent(): boolean {
    return !!localStorage.getItem('authKey');
  }
  private checkInitialAuthState(): void {
    if (this.getToken()) {
      this.isAuthenticated.next(true);
    } else {
      this.isAuthenticated.next(false);
    }
  }
}
