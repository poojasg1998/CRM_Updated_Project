import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CpApiService } from '../cp-api.service';
import { SharedService } from 'src/app/realEstate/shared.service';
import Swal from 'sweetalert2';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-my-executive',
  templateUrl: './my-executive.component.html',
  styleUrls: ['./my-executive.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MyExecutiveComponent implements OnInit {
  @ViewChild('scrollContent', { static: false }) scrollContent!: IonContent;
  showSpinner = false;
  executiveList: any;
  canScroll: boolean;

  constructor(public sharedService: SharedService) {}

  ngOnInit() {
    this.getExecutives();
  }

  getExecutives() {
    this.sharedService.getexecutiveslist().subscribe((resp) => {
      this.executiveList = resp['Executiveslist'];
    });
  }

  addNewExecutive() {
    Swal.fire({
      title: 'Upgrade to Premium Plan',
      html: 'Unlock exclusive features and benefits by upgrading today! <br><b>Feel free to contact us for more details.<b/>',
      icon: 'info',
      confirmButtonText: 'Contact Now',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      heightAuto: false,
      customClass: {
        popup: 'my-swal-popup',
        confirmButton: 'swal-confirm',
        cancelButton: 'swal-cancel',
        icon: 'swal-icon',
      },
    }).then((result) => {
      if (result.value) {
        window.open(
          'https://wa.me/9036166276?text=Hi,%20I%20would%20like%20to%20know%20more%20about%20the%20Premium%20Plan%20of%20Lead247%20CRM.',
          '_blank'
        );
      }
    });
  }

  onScroll(event: CustomEvent) {
    this.sharedService.scrollTop = event.detail.scrollTop;
    const scrollTop = event.detail.scrollTop;
    this.scrollContent.getScrollElement().then((scrollEl) => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.offsetHeight;

      this.canScroll = scrollHeight > clientHeight + 10;

      if (!this.canScroll) {
        this.sharedService.isBottom = false;
      } else {
        this.sharedService.isBottom =
          scrollTop + clientHeight >= scrollHeight - 100;
      }
    });
  }
}
