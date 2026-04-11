import { Component, OnInit } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { SharedService } from 'src/app/realEstate/shared.service';
import { CpApiService } from '../cp-api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cp-search',
  templateUrl: './cp-search.component.html',
  styleUrls: ['./cp-search.component.scss'],
})
export class CpSearchComponent implements OnInit {
  showSpinner: boolean = false;
  leads_detail: any[] = [];
  searchSubject = new Subject<string>();
  page: number;

  constructor(
    private sharedService: SharedService,
    private cpService: CpApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.searchSubject.pipe(debounceTime(300)).subscribe((searchTerm) => {
      this.fetchData(searchTerm);
    });
  }

  searchClient(event): void {
    this.showSpinner = true;
    const query = event.target.value.trim();

    // check if query contains only digits
    const isNumber = /^\d+$/.test(query);

    if ((isNumber && query.length >= 5) || (!isNumber && query.length > 2)) {
      this.searchSubject.next(query);
    } else {
      this.leads_detail = [];
      this.showSpinner = false;
    }
  }

  fetchData(query: string) {
    let searchedData;
    if (/^[\d\s+]+$/.test(query)) {
      searchedData = query.replace(/\s+/g, '');
      searchedData = searchedData.slice(-10);
    } else {
      searchedData = query;
    }
    this.cpService.searchLeads(searchedData, '', '', '').subscribe({
      next: (response) => {
        if (response['status'] == 'True') {
          this.leads_detail = response['Searchlist'];
          const groupedMap = new Map();
          this.showSpinner = false;
        } else {
          this.leads_detail = [];
          this.showSpinner = false;
        }
        console.log(this.leads_detail);
      },
      error: (error) => {
        this.leads_detail = [];
        this.showSpinner = false;
      },
    });
  }
  toggleSearchFocus() {
    this.sharedService.isBottom = !this.sharedService.isBottom;
  }

  onSwipe(event, lead: any) {
    if (event?.detail?.side == 'start' || event == 'chat') {
      window.open(`https://wa.me/+91 ${lead.number}`, '_system');
      // this.navigateToWhatsApp(lead.number);
    } else {
      window.open(`tel:${lead.number}`, '_system');
      if (lead && lead.number) {
        // Trigger the call
        window.open(`tel:${lead.number}`, '_system');
      } else {
        console.error('Phone number not available for the selected lead.');
      }
    }
  }

  navigateToDetailsPage(lead) {
    // this.sharedService.enquiries = this.leads_detail;
    // this.sharedService.page = this.page;
    // this.sharedService.hasState = true;
    this.router.navigate(['/cp-lead-details'], {
      queryParams: {
        execid: lead.execid,
        leadid: lead.customer_IDPK,
        categoryid: lead.category || null,
      },
    });
  }
}
