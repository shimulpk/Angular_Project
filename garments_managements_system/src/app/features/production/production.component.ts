import { Component } from '@angular/core';
import { FeaturePlaceholderComponent } from '../../shared/components/feature-placeholder/feature-placeholder.component';
@Component({
  selector: 'app-production',
  standalone: true,
  imports: [FeaturePlaceholderComponent],
  templateUrl: './production.component.html',
  styleUrl: './production.component.css'})
export class ProductionComponent {}
