import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeBox } from './recipe-box';

describe('RecipeBox', () => {
  let component: RecipeBox;
  let fixture: ComponentFixture<RecipeBox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeBox],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeBox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
