import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeService } from '../../services/recipe.services';
import { Recipe } from '../../models/recipe.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, combineLatestWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-recipe-box',
  imports: [CommonModule],
  templateUrl: './recipe-box.html',
  styleUrl: './recipe-box.css',
})
export class RecipeBox implements OnInit {
  private recipeService = inject(RecipeService);

  appName = 'Wizni Recipe Box';
  lastActionMessage = 'Ready to cook!';

  recipes$!: Observable<Recipe[]>;
  loading$ = this.recipeService.loading$;
  favoriteCount$ = this.recipeService.getFavoriteCount();

  private searchSubject = new BehaviorSubject<string>('');

  ngOnInit(): void {
    const search$: Observable<string> = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    );

    this.recipes$ = this.recipeService.recipes$.pipe(
      combineLatestWith(search$),
      map(([recipes, term]: [Recipe[], string]) =>
        recipes.filter((r) => r.title.toLowerCase().includes(term.toLowerCase()))
      )
    );
  }

  // Examples of event binding methods for the template

  // Search input
  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  // (blur)
  onInputBlur(): void {
    this.lastActionMessage = 'Search filter blurred';
  }

  // Add Recipe
  onAddRecipe(
    titleInput: HTMLInputElement,
    categorySelect: HTMLSelectElement,
    difficultySelect: HTMLSelectElement,
    imageInput: HTMLInputElement
  ): void {
    if (!titleInput.value.trim()) return;

    const title = titleInput.value.trim();
    const category = categorySelect.value as Recipe['category'];
    const difficulty = difficultySelect.value as Recipe['difficulty'];
    const imageUrl = imageInput.value.trim();

    const prepTimeMinutes = 30; 
  
  // 2. Pass it into the service:
  this.recipeService.addRecipe(
    title, 
    category, // Make sure your component types this as 'Breakfast' | 'Lunch' | etc.
    difficulty, 
    imageUrl, 
    prepTimeMinutes // <-- Now this variable actually exists!
  );
    this.lastActionMessage = `Added recipe: "${title}"`;

    titleInput.value = '';
    imageInput.value = '';
  }

  //Toggle Favorite
  onToggleFavorite(id: string | number): void {
    this.recipeService.toggleFavorite(id);
    this.lastActionMessage = `Updated favorite status for recipe #${id}`;
  }

  //Update Difficulty
  onDifficultyChange(id: string | number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const difficulty = select.value as Recipe['difficulty'];
    this.recipeService.updateDifficulty(id, difficulty);
    this.lastActionMessage = `Set recipe #${id} difficulty to ${difficulty}`;
  }

  //Delete Recipe
  onDeleteRecipe(id: string | number): void {
    this.recipeService.deleteRecipe(id);
    this.lastActionMessage = `Removed recipe #${id}`;
  }
}