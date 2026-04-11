import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cp-footer',
  templateUrl: './cp-footer.component.html',
  styleUrls: ['./cp-footer.component.scss'],
})
export class CpFooterComponent implements OnInit {
  constructor(public router: Router) {}

  ngOnInit() {}

  onNavigation(value) {
    if (value == 'dashboard') {
      this.router.navigate(['/cp-dashboard']);
    } else if (value == 'search') {
      this.router.navigate(['/cp-search']);
    } else {
      this.router.navigate(['/add-lead']);
    }
  }
}
