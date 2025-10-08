// Reduce Firebase SDK logs (e.g., WebChannel/transport warnings) in dev
setLogLevel('error');
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { setLogLevel } from 'firebase/app';

import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
