import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Recipe } from '../models/recipe.model';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/recipes`;
  private recipesSubject = new BehaviorSubject<Recipe[]>([]);
  public recipes$ = this.recipesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor() {
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.loadingSubject.next(true);
    this.http.get<Recipe[]>(this.apiUrl).subscribe({
      next: (recipes) => {
        this.recipesSubject.next(recipes);
        this.loadingSubject.next(false);
      },
      error: (err) => {
        console.error('Error fetching recipes from GCP:', err);
        this.loadingSubject.next(false);
      }
    });
  }

  getRecipeById(id: string | number): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/${id}`);
  }

  getFavoriteCount(): Observable<number> {
    return this.recipes$.pipe(
      map(recipes => recipes.filter(recipe => recipe.isFavorite).length)
    );
  }

  // --- (CRUD) ---

  addRecipe(title: string, category: string, difficulty: 'Easy' | 'Medium' | 'Hard', imageUrl: string): void {
    const newRecipe = { title, category, difficulty, imageUrl, isFavorite: false };
    
    this.loadingSubject.next(true);
    this.http.post<Recipe>(this.apiUrl, newRecipe).subscribe({
      next: (savedRecipe) => {
        const current = this.recipesSubject.value;
        this.recipesSubject.next([...current, savedRecipe]);
        this.loadingSubject.next(false);
      },
      error: (err) => {
        console.error('Error adding recipe:', err);
        this.loadingSubject.next(false);
      }
    });
  }

  toggleFavorite(id: string | number): void {
    const stringId = String(id); // Standardize to string
    const recipe = this.recipesSubject.value.find(r => String(r.id) === stringId);
    if (!recipe) return;

    const newStatus = !recipe.isFavorite;
    
    // Optimistic UI update
    this.updateLocalRecipeState(stringId, { isFavorite: newStatus });

    this.http.patch<Recipe>(`${this.apiUrl}/${stringId}`, { isFavorite: newStatus }).subscribe({
      error: (err) => {
        console.error('Failed to toggle favorite, reverting state.', err);
        this.updateLocalRecipeState(stringId, { isFavorite: !newStatus });
      }
    });
  }

  updateDifficulty(id: string | number, difficulty: 'Easy' | 'Medium' | 'Hard'): void {
    const stringId = String(id);
    const recipe = this.recipesSubject.value.find(r => String(r.id) === stringId);
    if (!recipe) return;

    const previousDifficulty = recipe.difficulty;

    // Optimistic UI update
    this.updateLocalRecipeState(stringId, { difficulty });

    this.http.patch<Recipe>(`${this.apiUrl}/${stringId}`, { difficulty }).subscribe({
      error: (err) => {
        console.error('Failed to update difficulty, reverting state.', err);
        this.updateLocalRecipeState(stringId, { difficulty: previousDifficulty });
      }
    });
  }

  deleteRecipe(id: string | number): void {
    const stringId = String(id);
    const previousState = this.recipesSubject.value;
    
    // Optimistic UI update
    this.recipesSubject.next(previousState.filter(r => String(r.id) !== stringId));

    this.http.delete(`${this.apiUrl}/${stringId}`).subscribe({
      error: (err) => {
        console.error('Failed to delete recipe, reverting state.', err);
        this.recipesSubject.next(previousState);
      }
    });
  }

  private updateLocalRecipeState(id: string, changes: Partial<Recipe>): void {
    const current = this.recipesSubject.value;
    const updated = current.map(recipe => 
      String(recipe.id) === id ? { ...recipe, ...changes } : recipe
    );
    this.recipesSubject.next(updated);
  }
}