import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'pokedex',
  },
  {
    path: 'pokedex',
    loadComponent: () =>
      import('./pokedex/pokedex-page/pokedex-page').then(
        (component) => component.PokedexPageComponent,
      ),
  },
  {
    path: 'teams',
    loadComponent: () =>
      import('./teams/pages/team-builder-page/team-builder-page').then(
        (component) => component.TeamBuilderPageComponent,
      ),
  },
];
