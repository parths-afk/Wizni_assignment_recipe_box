import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Recipe } from '../models/recipe.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private authService = inject(AuthService);
  private recipesSubject = new BehaviorSubject<Recipe[]>([]);
  public recipes$ = this.recipesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.loadRecipes();
      } else {
        this.recipesSubject.next([]);
      }
    });
  }

  loadRecipes(): void {
    this.loadingSubject.next(true);
    this.http.get<Record<string, Recipe>>(`${this.apiUrl}/recipes.json`).subscribe({
      next: (res) => {
        const recipesArray: Recipe[] = res 
          ? Object.keys(res).map(key => ({ ...res[key], id: key })) 
          : [];
          
        this.recipesSubject.next(recipesArray);
        this.loadingSubject.next(false);
      },
      error: (err) => {
        console.error('Error fetching recipes from GCP:', err);
        this.loadingSubject.next(false);
      }
    });
  }

  getRecipeById(id: string | number): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/recipes/${id}.json`);
  }

  getFavoriteCount(): Observable<number> {
    return this.recipes$.pipe(
      map(recipes => recipes.filter(recipe => recipe.isFavorite).length)
    );
  }

  // --- (CRUD) ---
  addRecipe(
    title: string, 
    category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert', // <-- Updated type
    difficulty: 'Easy' | 'Medium' | 'Hard', 
    imageUrl: string, 
    prepTimeMinutes: number
  ): void {
    
    const newRecipe = { title, category, difficulty, imageUrl, prepTimeMinutes, isFavorite: false };
    
    this.loadingSubject.next(true);
    this.http.post<{ name: string }>(`${this.apiUrl}/recipes.json`, newRecipe).subscribe({
      next: (res) => {
        const savedRecipe: Recipe = { ...newRecipe, id: res.name };
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
    const stringId = String(id);
    const recipe = this.recipesSubject.value.find(r => String(r.id) === stringId);
    if (!recipe) return;

    const newStatus = !recipe.isFavorite;
    this.updateLocalRecipeState(stringId, { isFavorite: newStatus });

    this.http.patch<Recipe>(`${this.apiUrl}/recipes/${stringId}.json`, { isFavorite: newStatus }).subscribe({
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
    this.updateLocalRecipeState(stringId, { difficulty });

    this.http.patch<Recipe>(`${this.apiUrl}/recipes/${stringId}.json`, { difficulty }).subscribe({
      error: (err) => {
        console.error('Failed to update difficulty, reverting state.', err);
        this.updateLocalRecipeState(stringId, { difficulty: previousDifficulty });
      }
    });
  }

  deleteRecipe(id: string | number): void {
    const stringId = String(id);
    const previousState = this.recipesSubject.value;
    
    this.recipesSubject.next(previousState.filter(r => String(r.id) !== stringId));

    this.http.delete(`${this.apiUrl}/recipes/${stringId}.json`).subscribe({
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