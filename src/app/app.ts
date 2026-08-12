import { Component, inject} from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
// import { RecipeBox } from './components/recipe-box/recipe-box';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, RouterLink],
  template: `
    <nav class="navbar navbar-expand navbar-dark bg-dark mb-4 shadow-sm">
      <div class="container">
        <a class="navbar-brand fw-bold" routerLink="/"><span>😋</span> Wizni Recipe Box</a>
        
        <div class="d-flex align-items-center">
          @if (authService.user$ | async) {
            <span class="text-light me-3 d-none d-md-inline">Welcome!</span>
            <button class="btn btn-outline-light btn-sm" (click)="logout()">Logout</button>
          } @else {
            <a class="btn btn-outline-light btn-sm me-2" routerLink="/login">Login</a>
            <a class="btn btn-primary btn-sm" routerLink="/signup">Sign Up</a>
          }
        </div>
      </div>
    </nav>
    <main>
      <router-outlet></router-outlet>
    </main>`,
  styleUrl: './app.css'
})
export class App {
  authService = inject(AuthService);
  private router = inject(Router);

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}