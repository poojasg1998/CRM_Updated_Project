import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NativeBiometric } from 'capacitor-native-biometric';
import { BiometricService } from 'src/app/realEstate/biometric.service';
import { SharedService } from 'src/app/realEstate/shared.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cp-menubar',
  templateUrl: './cp-menubar.component.html',
  styleUrls: ['./cp-menubar.component.scss'],
})
export class CpMenubarComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  isFingureprintEnabled: boolean = false;
  iscpId: boolean;
  roleid: string;
  userid: string;
  visitsAccordion: boolean = false;
  reportAccordion: boolean = false;
  accordionOpen: boolean = false;
  roletype: string;
  cpId: string;

  constructor(
    public sharedService: SharedService,
    public mainSharedService: SharedService,
    private biometricService: BiometricService,
    public router: Router
  ) {
    this.isFingureprintEnabled = localStorage.getItem('useBiometric') == 'true';
    this.iscpId = localStorage.getItem('cpId') === '1';
    this.roleid = localStorage.getItem('Role');
    this.userid = localStorage.getItem('UserId');
    this.roletype = localStorage.getItem('RoleType');
    this.cpId = localStorage.getItem('cpId');
  }

  ngOnInit() {}

  onMenu(data) {}

  getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Returns 'YYYY-MM-DD'
  }
  toggleAccordion() {
    this.reportAccordion = false;
    this.visitsAccordion = false;
    this.accordionOpen = !this.accordionOpen;
  }
  toggleVisitsBtn() {
    this.accordionOpen = false;
    this.reportAccordion = false;
    this.visitsAccordion = !this.visitsAccordion;
  }

  onDashboard(state) {
    this.router.navigate(['/cp-dashboard'], {
      queryParams: {
        isLeadsVisits: state,
      },
    });
  }

  async enableFingerprint(event) {
    const result = await NativeBiometric.isAvailable();

    if (!result.isAvailable) {
      alert(
        'Biometric login is unavailable. Please set it up or wait if it’s locked, or use your password instead.'
      );
      event.detail.checked = false;
      return;
    }
    this.isFingureprintEnabled = localStorage.getItem('useBiometric') == 'true';
    await NativeBiometric.verifyIdentity({
      reason: 'Please authenticate to login',
      fallbackTitle: 'Use device passcode',
    })
      .then(async () => {
        if (localStorage.getItem('useBiometric') == 'true') {
          Swal.fire({
            title: 'Fingerprint Disabled',
            text: 'Fingerprint login has been turned off.',
            icon: 'info',
            confirmButtonText: 'OK',
            heightAuto: false,
          }).then((result) => {
            this.isFingureprintEnabled = false;
            localStorage.removeItem('useBiometric');
          });
        } else {
          Swal.fire({
            title: 'Success',
            text: 'Fingerprint login has been successfully enabled!',
            confirmButtonText: 'OK',
            heightAuto: false,
            icon: 'success',
          }).then((result) => {});
          await this.biometricService.saveCredentials(
            localStorage.getItem('Mail'),
            localStorage.getItem('Password')
          );
          localStorage.setItem('useBiometric', 'true');
          this.isFingureprintEnabled = true;
        }
      })
      .catch((err: any) => {
        console.log('Authentication failed or cancelled', err?.message);
      });
  }

  async logout() {
    Object.keys(localStorage).forEach((key) => {
      if (key !== 'Mail' && key !== 'Password' && key !== 'useBiometric') {
        localStorage.removeItem(key);
      }
    });
  }
  resetStoredData() {
    this.sharedService.enquiries = [];
    this.sharedService.hasState = false;
  }
}
