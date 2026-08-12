import { Routes } from '@angular/router';
import { authGuard } from './gaurds/auth.gaurd';
import { recipeResolver } from './resolvers/recipe.resolver';

// angular routing
// Enables multi-page navigation across URLs.
// ALL components here use lazy loading, which means they are loaded only when the user navigates to that route.

export const routes: Routes = [
  { path: '', redirectTo: 'recipes', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent) 
  },
  { 
    path: 'signup', 
    loadComponent: () => import('./components/signup/signup').then(m => m.SignupComponent) 
  },
  {
    path: 'recipes',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/recipe-box/recipe-box').then(m => m.RecipeBox)
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