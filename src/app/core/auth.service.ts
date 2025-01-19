import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private authToken = new BehaviorSubject<string>('');

    setToken(token: string) {
        this.authToken.next(token);
        localStorage.setItem('token', token);
    }

    getToken() {
        return this.authToken.value || localStorage.getItem('token');
    }

    logout() {
        this.authToken.next('');
        localStorage.removeItem('token');
    }
}
