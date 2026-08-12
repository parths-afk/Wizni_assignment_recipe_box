import { ResolveFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { RecipeService } from '../services/recipe.services';
import { Recipe } from '../models/recipe.model';
import { catchError, EMPTY } from 'rxjs';

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