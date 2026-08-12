import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <h3 class="card-title text-center mb-4">Wizni recipes</h3>
              
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
                  <input type="password" class="form-control" [(ngModel)]="password" name="password" required>
                </div>
                <button type="submit" class="btn btn-primary w-100" [disabled]="isLoading">
                  @if (isLoading) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                  }
                  Sign In
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  async onSubmit() {
    if (!this.email || !this.password) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.login(this.email, this.password);
      await this.router.navigate(['/recipes']);
    } catch (err: any) {
      this.errorMessage = this.getErrorMessage(err.code);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Incorrect email or password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again later.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      default:
        return 'Failed to log in. Please check your network and credentials.';
    }
  }
}