import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ShreeindustriesDashboardComponent } from './shreeindustries-dashboard.component';

describe('ShreeindustriesDashboardComponent', () => {
  let component: ShreeindustriesDashboardComponent;
  let fixture: ComponentFixture<ShreeindustriesDashboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShreeindustriesDashboardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ShreeindustriesDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
