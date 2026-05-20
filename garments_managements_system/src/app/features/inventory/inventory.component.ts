import { Component } from '@angular/core';
import { FeaturePlaceholderComponent } from '../../shared/components/feature-placeholder/feature-placeholder.component';
@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [FeaturePlaceholderComponent],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'})
export class InventoryComponent {}
