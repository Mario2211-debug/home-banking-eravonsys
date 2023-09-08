import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, map, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    public user: any;
    private authHeader?: string;

    constructor(private http: HttpClient, private router: Router) {}

    register(email: string | null, password: string | null, name?: string) {
        const url = environment.apiUrl + 'singup';
        return this.http.post(url, { email, password, name }).pipe(
            catchError((error) => {
                return throwError(error)
            })
        );
    }

    login(email: string | null, password: string | null) {
        const url = environment.apiUrl + 'login';
        return this.http
            .post(url, { email, password }, { observe: 'response' })
            .pipe(
                map((res: HttpResponse<any>) => {
                    const header = res.headers.get('Authorization');
                    if (header) {
                        this.authHeader = header;
                        this.user = res.body.user;
                        return { success: true };
                    }
                    return { success: false, feedback: <string>res.body };
                })
            );
    }

    getAuthHeader() {
        return { Authorization: <string>this.authHeader };
    }

    isLoggedIn() {
        return !!this.authHeader;
    }

    logout() {
        this.authHeader = undefined;
        this.router.navigateByUrl('');
    }
}
