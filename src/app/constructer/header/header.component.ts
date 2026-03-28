import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ShreeindustriesApiService } from '../shreeindustries-api.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  tabid = '';
  isAfterOneminute = false;
  isAfterTwominute = false;
  callStatus: any = '';
  isOnCallgoing = false;
  isOnCallDetailsPage = false;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private shreeindutriesService: ShreeindustriesApiService
  ) {}

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params) => {
      this.tabid = params['tabid'];
      if (params['isOnCallDetailsPage'] == 'true') {
        this.isOnCallDetailsPage = true;
      } else {
        this.isOnCallDetailsPage = false;
      }
    });
  }

  onJobsLeads(tabid) {
    this.router.navigate([], {
      queryParams: {
        tabid: tabid,
      },
      queryParamsHandling: 'merge',
    });
  }

  handleCloseClick() {
    if (
      this.isAfterOneminute &&
      (this.callStatus === 'Call Connected' ||
        this.callStatus == 'Answered' ||
        this.callStatus == 'CONNECTING')
    ) {
      this.forceToCallDisconnect();
    } else if (
      this.callStatus == 'Call Disconnected' ||
      this.callStatus == 'BUSY' ||
      this.callStatus == 'Executive Busy'
    ) {
      this.isOnCallgoing = false;
      this.callStatus = '';
      location.reload();
    } else if (this.isAfterTwominute && this.callStatus == 'CONNECTING') {
      this.forceToCallDisconnect();
    } else if (
      this.isOnCallDetailsPage &&
      (this.callStatus === 'Call Connected' ||
        this.callStatus == 'Answered' ||
        this.callStatus == 'CONNECTING' ||
        this.callStatus == 'Call Disconnected')
    ) {
      this.isOnCallgoing = false;
    }
  }

  forceToCallDisconnect() {
    const number = localStorage.getItem('Number');
    const cleanedNumber =
      number.startsWith('91') && number.length > 10 ? number.slice(2) : number;

    Swal.fire({
      title: 'Disconnect Call?',
      text: 'Are you sure you want to disconnect this call?',
      icon: 'warning',
      showCancelButton: true,
      heightAuto: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        // this.sharedService
        //   .onCallDisconnected(cleanedNumber)
        //   .subscribe((response) => {
        //     this.isOnCallgoing = false;
        //   });
      }
    });
  }

  //  https://superadmin-azure.right2shout.in/shreeindustriesController/logout
  // logout() {
  //   this.shreeindutriesService.logOut(
  //     localStorage.getItem('session_id'),
  //     localStorage.getItem('UserId')
  //   );
  // }

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
    location.reload();
    this.router.navigate(['/login']);
  }

  onMenu(data) {
    if (data == 'marketing') {
      this.router.navigate(['marketing-calls'], {
        queryParams: {
          isDateFilter: 'allTime',
          fromdate: new Date().toLocaleDateString('en-CA'),
          todate: new Date().toLocaleDateString('en-CA'),
        },
      });
    }
  }
}
