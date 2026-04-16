import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root',
})
export class CanActivateGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthServiceService
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const department = localStorage.getItem('Department');
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/login']);
    }

    if (department == '10005') {
      return this.router.createUrlTree(['/source-dashboard'], {
        queryParams: {
          fromDate: new Date().toLocaleDateString('en-CA'),
          toDate: new Date().toLocaleDateString('en-CA'),
          isDateFilter: 'today',
          status: 'Total',
          activeCardKey: 'total_card',
          leads: '1',
        },
      });
    }

    if (department == '10006') {
      return this.router.createUrlTree(['/employeeAttendance'], {
        queryParams: {
          fromdate: new Date().toLocaleDateString('en-CA'),
          todate: new Date().toLocaleDateString('en-CA'),
          execid: localStorage.getItem('UserId'),
          isDateFilter: 'today',
        },
      });
    }

    if (localStorage.getItem('crmcategory_IDFK') == '2') {
      return this.router.createUrlTree(['/shreeindustries-dashboard'], {
        queryParams: {
          isDateFilter: 'allTime',
          activeCardKey: 'total_card',
          tabid: '1',
          status: '0',
        },
      });
    }

    if (localStorage.getItem('contrllerName')) {
      return this.router.createUrlTree(['/cp-dashboard']);
    }

    // if (!this.authService.isAuthenticated()) {
    //   return this.router.parseUrl('/login');
    // }

    // const department = localStorage.getItem('department');

    // // ✅ Only redirect when user is trying to access HOME
    // if (department === '10006' && state.url === '/home') {
    //   return this.router.createUrlTree(['/employeeAttendance'], {
    //     queryParams: {
    //       fromdate: new Date().toLocaleDateString('en-CA'),
    //       todate: new Date().toLocaleDateString('en-CA'),
    //       execid: localStorage.getItem('UserId'),
    //       isDateFilter: 'today',
    //     },
    //   });
    // }

    return true;
  }
}
