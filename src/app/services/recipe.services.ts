import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Recipe } from '../models/recipe.model';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/recipes';

  private recipesSubject = new BehaviorSubject<Recipe[]>([]);
  public recipes$: Observable<Recipe[]> = this.recipesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor() {
    this.fetchRecipes();
  }

  // GET
  fetchRecipes(): void {
    this.loadingSubject.next(true);
    this.http.get<Recipe[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.recipesSubject.next(data);
        this.loadingSubject.next(false);
      },
      error: () => this.loadingSubject.next(false),
    });
  }

  // RxJS
  getFavoriteCount(): Observable<number> {
    return this.recipes$.pipe(
      map((recipes) => recipes.filter((r) => r.isFavorite).length)
    );
  }

  // POST
  addRecipe(title: string, category: Recipe['category'], difficulty: Recipe['difficulty'], imageUrl: string): void {
    const newRecipe: Omit<Recipe, 'id'> = {
      title,
      category,
      difficulty,
      prepTimeMinutes: 20,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400',
      isFavorite: false,
    };

    this.http.post<Recipe>(this.apiUrl, newRecipe).subscribe({
      next: (created) => {
        const current = this.recipesSubject.getValue();
        this.recipesSubject.next([created, ...current]);
      },
    });
  }

  // PATCH
  toggleFavorite(id: string | number): void {
    const current = this.recipesSubject.getValue();
    const recipe = current.find((r) => r.id === id);
    if (!recipe) return;

    this.http.patch<Recipe>(`${this.apiUrl}/${id}`, { isFavorite: !recipe.isFavorite }).subscribe({
      next: (updated) => {
        this.recipesSubject.next(current.map((r) => (r.id === id ? updated : r)));
      },
    });
  }

  // PATCH
  updateDifficulty(id: string | number, difficulty: Recipe['difficulty']): void {
    const current = this.recipesSubject.getValue();
    this.http.patch<Recipe>(`${this.apiUrl}/${id}`, { difficulty }).subscribe({
      next: (updated) => {
        this.recipesSubject.next(current.map((r) => (r.id === id ? updated : r)));
      },
    });
  }

  // DELETE
  deleteRecipe(id: string | number): void {
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        const filtered = this.recipesSubject.getValue().filter((r) => r.id !== id);
        this.recipesSubject.next(filtered);
      },
    });
  }
}