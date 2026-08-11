export interface Recipe {
  id: string | number;
  title: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert';
  prepTimeMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  imageUrl: string;
  isFavorite: boolean;
}