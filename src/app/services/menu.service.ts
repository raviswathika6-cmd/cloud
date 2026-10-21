import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  rating: number;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuItems: MenuItem[] = [
    {
      id: 1,
      name: 'Vegetable Biryani',
      description: 'Fragrant basmati rice cooked with mixed vegetables and spices',
      price: 150,
      category: 'Main Course',
      image: 'https://via.placeholder.com/300x200?text=Veg+Biryani',
      available: true,
      rating: 4.5
    },
    {
      id: 2,
      name: 'Butter Paneer',
      description: 'Soft paneer cubes in creamy tomato-based sauce',
      price: 200,
      category: 'Main Course',
      image: 'https://via.placeholder.com/300x200?text=Butter+Paneer',
      available: true,
      rating: 4.8
    },
    {
      id: 3,
      name: 'Dal Makhni',
      description: 'Creamy lentils cooked overnight with butter and cream',
      price: 120,
      category: 'Main Course',
      image: 'https://via.placeholder.com/300x200?text=Dal+Makhni',
      available: true,
      rating: 4.6
    },
    {
      id: 4,
      name: 'Naan Bread',
      description: 'Traditional Indian flatbread baked in tandoor',
      price: 40,
      category: 'Bread',
      image: 'https://via.placeholder.com/300x200?text=Naan',
      available: true,
      rating: 4.7
    },
    {
      id: 5,
      name: 'Roti',
      description: 'Whole wheat Indian flatbread',
      price: 20,
      category: 'Bread',
      image: 'https://via.placeholder.com/300x200?text=Roti',
      available: true,
      rating: 4.4
    },
    {
      id: 6,
      name: 'Mango Lassi',
      description: 'Refreshing yogurt-based drink with mango pulp',
      price: 60,
      category: 'Beverages',
      image: 'https://via.placeholder.com/300x200?text=Mango+Lassi',
      available: true,
      rating: 4.5
    },
    {
      id: 7,
      name: 'Lemon Tea',
      description: 'Hot tea with fresh lemon and honey',
      price: 30,
      category: 'Beverages',
      image: 'https://via.placeholder.com/300x200?text=Lemon+Tea',
      available: true,
      rating: 4.3
    },
    {
      id: 8,
      name: 'Gulab Jamun',
      description: 'Sweet milk solids in sugar syrup',
      price: 80,
      category: 'Desserts',
      image: 'https://via.placeholder.com/300x200?text=Gulab+Jamun',
      available: true,
      rating: 4.6
    },
    {
      id: 9,
      name: 'Kheer',
      description: 'Rice pudding with condensed milk and nuts',
      price: 90,
      category: 'Desserts',
      image: 'https://via.placeholder.com/300x200?text=Kheer',
      available: true,
      rating: 4.7
    },
    {
      id: 10,
      name: 'Samosa',
      description: 'Crispy pastry with spiced potato filling',
      price: 25,
      category: 'Snacks',
      image: 'https://via.placeholder.com/300x200?text=Samosa',
      available: true,
      rating: 4.4
    },
    {
      id: 11,
      name: 'Chaat',
      description: 'Mix of crispy wafers, tamarind chutney, and spices',
      price: 50,
      category: 'Snacks',
      image: 'https://via.placeholder.com/300x200?text=Chaat',
      available: false,
      rating: 4.2
    },
    {
      id: 12,
      name: 'Masala Dosa',
      description: 'Crispy rice crepes with spiced potato filling',
      price: 100,
      category: 'Main Course',
      image: 'https://via.placeholder.com/300x200?text=Masala+Dosa',
      available: true,
      rating: 4.8
    }
  ];

  constructor() { }

  getMenuItems(): Observable<MenuItem[]> {
    return of(this.menuItems);
  }

  getMenuItemsByCategory(category: string): Observable<MenuItem[]> {
    const filtered = this.menuItems.filter(item => item.category === category);
    return of(filtered);
  }

  getCategories(): Observable<string[]> {
    const categories = [...new Set(this.menuItems.map(item => item.category))];
    return of(categories);
  }

  getMenuItemById(id: number): Observable<MenuItem | undefined> {
    return of(this.menuItems.find(item => item.id === id));
  }
}
