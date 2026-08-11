import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RecipeBox } from './components/recipe-box/recipe-box';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RecipeBox],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('assignment-3');
}
