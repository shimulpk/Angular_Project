import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api/api.service';
import { Style } from '../../../models/style/style.model';
@Component({
  selector: 'app-style-library',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './style-library.component.html',
  styleUrl: './style-library.component.css'})
export class StyleLibraryComponent implements OnInit {
  private api = inject(ApiService);
  styles: Style[] = [];

  ngOnInit() {
    this.api.getAll<Style>('styles').subscribe(data => this.styles = data);
  }
}
