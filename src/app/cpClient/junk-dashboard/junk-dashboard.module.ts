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
import { JunkDashboardComponent } from './junk-dashboard.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: JunkDashboardComponent,
      },
    ]),
    IonicModule,
    FormsModule,
    DropdownModule,
    MultiSelectModule,
    IonRangeCalendarModule,
    CalendarModule,
    NgMultiSelectDropDownModule,
  ],

  declarations: [JunkDashboardComponent],
})
export class JunkDashboardModule {}
