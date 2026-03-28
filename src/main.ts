import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.log(err));

// import { initializeApp } from 'firebase/app';

// const firebaseConfig = {
//   apiKey: 'AIzaSyAQUvkNj-j3HcoOQNeoTiEWtFKXM4RdLLk',
//   authDomain: 'sitecrm-357c7.firebaseapp.com',
//   projectId: 'sitecrm-357c7',
//   storageBucket: 'sitecrm-357c7.firebasestorage.app',
//   messagingSenderId: '638624651088',
//   appId: '1:638624651088:web:947f45203e13f619393e55',
// };

// initializeApp(firebaseConfig);
