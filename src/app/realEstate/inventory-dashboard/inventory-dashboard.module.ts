import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonRangeCalendarModule } from '@googlproxer/ion-range-calendar';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { SharedModule } from '../shared.module';
import { InventoryDashboardComponent } from './inventory-dashboard.component';
import { PhotoGalleryModule } from '@twogate/ngx-photo-gallery';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: InventoryDashboardComponent,
      },
    ]),
    IonicModule,
    DropdownModule,
    MultiSelectModule,
    ReactiveFormsModule,
    IonRangeCalendarModule,
    SharedModule,
    FormsModule,
    CalendarModule,
    AutoCompleteModule,
    PhotoGalleryModule,
    ToastModule,
  ],
  declarations: [InventoryDashboardComponent],
  providers: [MessageService],
})
export class InventoryDashboardModule {}
