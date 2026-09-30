import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pokedex/pokedex-page/pokedex-page').then(
        (component) => component.PokedexPageComponent,
      ),
  },
];
