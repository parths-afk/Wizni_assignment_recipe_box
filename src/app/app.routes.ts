import { Routes } from '@angular/router';
import { authGuard } from './gaurds/auth.gaurd';
import { recipeResolver } from './resolvers/recipe.resolver';

export const routes: Routes = [
  { path: '', redirectTo: 'recipes', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent) 
  },
  {
    path: 'recipes',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/recipe-box/recipe-box').then(m => m.RecipeBoxComponent)
      },
      {
        path: ':id',
        resolve: { recipe: recipeResolver },
        loadComponent: () => import('./components/recipe-detail/recipe-detail').then(m => m.RecipeDetailComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'recipes' }
];