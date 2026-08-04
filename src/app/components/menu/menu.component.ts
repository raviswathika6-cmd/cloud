import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService, MenuItem } from '../../services/menu.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  menuItems: MenuItem[] = [];
  filteredItems: MenuItem[] = [];
  categories: string[] = [];
  selectedCategory: string = 'All';
  searchQuery: string = '';
  cart: { item: MenuItem; quantity: number }[] = [];
  showCart: boolean = false;

  constructor(private menuService: MenuService) {}

  ngOnInit(): void {
    this.loadMenuItems();
    this.loadCategories();
  }

  loadMenuItems(): void {
    this.menuService.getMenuItems().subscribe(items => {
      this.menuItems = items;
      this.applyFilters();
    });
  }

  loadCategories(): void {
    this.menuService.getCategories().subscribe(categories => {
      this.categories = ['All', ...categories];
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.menuItems;

    if (this.selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === this.selectedCategory);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    this.filteredItems = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  addToCart(item: MenuItem): void {
    const existingItem = this.cart.find(cartItem => cartItem.item.id === item.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({ item, quantity: 1 });
    }
    this.showNotification('Added to cart!');
  }

  removeFromCart(itemId: number): void {
    this.cart = this.cart.filter(cartItem => cartItem.item.id !== itemId);
  }

  updateQuantity(itemId: number, quantity: number): void {
    const cartItem = this.cart.find(item => item.item.id === itemId);
    if (cartItem) {
      if (quantity <= 0) {
        this.removeFromCart(itemId);
      } else {
        cartItem.quantity = quantity;
      }
    }
  }

  getTotalPrice(): number {
    return this.cart.reduce((total, item) => total + (item.item.price * item.quantity), 0);
  }

  getCartCount(): number {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  toggleCart(): void {
    this.showCart = !this.showCart;
  }

  placeOrder(): void {
    if (this.cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    alert(`Order placed! Total: ₹${this.getTotalPrice()}`);
    this.cart = [];
    this.showCart = false;
  }

  private showNotification(message: string): void {
    // Simple notification - in a real app, you might use a toast service
    console.log(message);
  }

  getRatingColor(rating: number): string {
    if (rating >= 4.5) return '#FFD700'; // Gold
    if (rating >= 4) return '#87CEEB'; // Sky blue
    return '#FFA07A'; // Light salmon
  }
}
