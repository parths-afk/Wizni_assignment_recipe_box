import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <button class="btn btn-outline-secondary mb-3" routerLink="/recipes">
        &larr; Back to Recipes
      </button>

      @if (recipe) {
        <div class="card shadow-sm">
          <img [src]="recipe.imageUrl" class="card-img-top" [alt]="recipe.title" style="height: 400px; object-fit: cover;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h1 class="card-title mb-0">{{ recipe.title }}</h1>
              <span class="badge bg-primary fs-5">{{ recipe.category }}</span>
            </div>
            
            <div class="d-flex gap-3 text-muted mb-4">
              <span><i class="bi bi-clock"></i> {{ recipe.prepTimeMinutes }} mins</span>
              <span><i class="bi bi-bar-chart"></i> {{ recipe.difficulty }}</span>
              @if (recipe.isFavorite) {
                <span class="text-danger"><i class="bi bi-heart-fill"></i> Favorite</span>
              }
            </div>

            <p class="card-text">
              <!-- Render recipe instructions or description here -->
              This is where the delicious details for {{ recipe.title }} live.
            </p>
          </div>
        </div>
      } @else {
        <div class="text-center mt-5">
          <div class="spinner-border text-primary" role="status"></div>
        </div>
      }
    </div>
  `
})
export class RecipeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  recipe!: Recipe;

  ngOnInit() {
    // Data is pre-fetched by the resolver, so it's immediately available synchronously
    this.recipe = this.route.snapshot.data['recipe'];
  }
}