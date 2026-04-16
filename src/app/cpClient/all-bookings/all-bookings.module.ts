import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CalendarModule } from 'primeng/calendar';
import { IonRangeCalendarModule } from '@googlproxer/ion-range-calendar';
import { CpSharedModule } from '../cp-shared/cp-shared.module';
import { AllBookingsComponent } from './all-bookings.component';
import { SharedModule } from 'src/app/realEstate/shared.module';
import { PhotoGalleryModule } from '@twogate/ngx-photo-gallery';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: AllBookingsComponent,
      },
    ]),
    IonicModule,
    FormsModule,
    DropdownModule,
    MultiSelectModule,
    IonRangeCalendarModule,
    CalendarModule,
    SharedModule,
    PhotoGalleryModule,
    NgMultiSelectDropDownModule,
    CpSharedModule,
  ],

  declarations: [AllBookingsComponent],
})
export class AllBookingsModule {}
