import { Component } from '@angular/core';
import { FeaturePlaceholderComponent } from '../../shared/components/feature-placeholder/feature-placeholder.component';
@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [FeaturePlaceholderComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'})
export class OrdersComponent {}
