import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes'; // 🔹 Ajout de l'import manquant
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ReactiveFormsModule } from '@angular/forms';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(ReactiveFormsModule),
    provideRouter(routes), // 🔹 Maintenant, 'routes' est défini
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([])),
    
  ]
};
