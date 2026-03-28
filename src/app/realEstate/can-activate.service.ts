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
    if (this.authService.isAuthenticated()) {
      // User is logged in, allow navigation
      const department = localStorage.getItem('Department'); // or from service

      if (department == '10006') {
        this.router.navigate(['/employeeAttendance'], {
          queryParams: {
            fromdate: new Date().toLocaleDateString('en-CA'),
            todate: new Date().toLocaleDateString('en-CA'),
            execid: localStorage.getItem('UserId'),
            isDateFilter: 'today',
          },
        });
        return false; // stop loading dashboard module
      } else if (localStorage.getItem('crmcategory_IDFK') == '2') {
        this.router.navigate(['shreeindustries-dashboard'], {
          queryParams: {
            isDateFilter: 'allTime',
            activeCardKey: 'total_card',
            tabid: '1',
            status: '0',
          },
        });
        return false;
      }
      return true;
    } else {
      // User is not logged in, redirect to login
      this.router.navigate(['/login']);
      return false;
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
