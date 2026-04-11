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
import { SharedModule } from 'src/app/realEstate/shared.module';
import { CpSearchComponent } from './cp-search.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: CpSearchComponent,
      },
    ]),
    IonicModule,
    FormsModule,
    DropdownModule,
    MultiSelectModule,
    IonRangeCalendarModule,
    CalendarModule,
    SharedModule,
    NgMultiSelectDropDownModule,
    CpSharedModule,
  ],

  declarations: [CpSearchComponent],
})
export class CpSearchModule {}
