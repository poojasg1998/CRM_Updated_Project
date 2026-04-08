import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cp-header',
  templateUrl: './cp-header.component.html',
  styleUrls: ['./cp-header.component.scss'],
})
export class CpHeaderComponent implements OnInit {
  constructor(public router: Router) {}

  ngOnInit() {}
}
