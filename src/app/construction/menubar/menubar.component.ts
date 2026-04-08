import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ShreeindustriesApiService } from '../shreeindustries-api.service';

@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.scss'],
})
export class MenubarComponent implements OnInit {
  constructor(
    private router: Router,
    public shreeindutriesService: ShreeindustriesApiService
  ) {}

  ngOnInit() {}

  onMenu(data) {
    if (data == 'dashboard') {
      this.router.navigate(['shreeindustries-dashboard'], {
        queryParams: {
          isDateFilter: 'allTime',
          activeCardKey: 'total_card',
          tabid: '1',
          status: '0',
        },
      });
    } else {
      this.router.navigate(['/marketing-calls'], {
        queryParams: {
          isDateFilter: 'allTime',
        },
      });
    }
  }
  onmarketingpageNavigation() {
    this.router.navigate(['/marketing-calls'], {
      queryParams: {
        isDateFilter: 'allTime',
        fromdate: new Date().toLocaleDateString('en-CA'),
        todate: new Date().toLocaleDateString('en-CA'),
      },
    });
  }

  ondashboardNavigation() {
    this.router.navigate(['shreeindustries-dashboard'], {
      queryParams: {
        isDateFilter: 'allTime',
        activeCardKey: 'total_card',
        tabid: '1',
        status: '0',
      },
    });
  }

  async logout() {
    this.shreeindutriesService.logOut(
      localStorage.getItem('session_id'),
      localStorage.getItem('UserId')
    );
    localStorage.removeItem('isLoggedIn');
    Object.keys(localStorage).forEach((key) => {
      if (key !== 'Mail' && key !== 'Password' && key !== 'useBiometric') {
        localStorage.removeItem(key);
      }
    });
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
