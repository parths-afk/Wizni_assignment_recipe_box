import { ResolveFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { RecipeService } from '../services/recipe.services';
import { Recipe } from '../models/recipe.model';
import { catchError, EMPTY } from 'rxjs';

// Fetches data over HTTP before rendering the route view.
// Resolver to fetch a recipe by ID before navigating to the recipe detail page. If the recipe is not found, it redirects to the recipes list.

export const recipeResolver: ResolveFn<Recipe> = (route) => {
  const recipeService = inject(RecipeService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  if (!id) {
    router.navigate(['/recipes']);
    return EMPTY;
  }

  return recipeService.getRecipeById(id).pipe(
    catchError(() => {
      router.navigate(['/recipes']);
      return EMPTY;
    })
  );
};