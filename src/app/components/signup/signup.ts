import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <h3 class="card-title text-center mb-4">Create Account</h3>
              
              @if (errorMessage) {
                <div class="alert alert-danger">{{ errorMessage }}</div>
              }

              <form (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" [(ngModel)]="email" name="email" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input type="password" class="form-control" [(ngModel)]="password" name="password" required minlength="6">
                  <div class="form-text">Must be at least 6 characters.</div>
                </div>
                <button type="submit" class="btn btn-success w-100" [disabled]="isLoading">
                  @if (isLoading) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                  }
                  Sign Up
                </button>
              </form>
              
              <div class="text-center mt-3">
                <p class="mb-0">Already have an account? <a routerLink="/login">Log in here</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SignupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  async onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      await this.authService.signup(this.email, this.password);
      this.router.navigate(['/recipes']);
    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to create an account. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}