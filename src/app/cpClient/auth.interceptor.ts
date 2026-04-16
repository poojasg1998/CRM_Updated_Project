import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const clientId = localStorage.getItem('client_id');

    // Check if the URL contains your specific domain AND the retailcrm keyword
    const isCpApi =
      request.url.includes('superadmin-azure.right2shout.in') &&
      request.url.includes('retailcrm');

    if (clientId && isCpApi) {
      // Clone the request to add the header
      request = request.clone({
        setHeaders: {
          'client-id': clientId,
        },
      });
    }

    return next.handle(request);
  }
}
