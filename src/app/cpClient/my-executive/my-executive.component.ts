import { Component, OnInit } from '@angular/core';
import { CpApiService } from '../cp-api.service';
import { SharedService } from 'src/app/realEstate/shared.service';

@Component({
  selector: 'app-my-executive',
  templateUrl: './my-executive.component.html',
  styleUrls: ['./my-executive.component.scss'],
})
export class MyExecutiveComponent implements OnInit {
  showSpinner = false;
  executiveList: any;

  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    this.getExecutives();
  }

  getExecutives() {
    this.sharedService.getexecutiveslist().subscribe((resp) => {
      this.executiveList = resp['Executiveslist'];
    });
  }
}
