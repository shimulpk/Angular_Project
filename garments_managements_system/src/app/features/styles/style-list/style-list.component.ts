import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StyleService } from '../style-service/style.service';
import { Style } from '../../../models/style/style.model';
import { ApiService } from '../../../core/services/api/api.service';
@Component({
  selector: 'app-style-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './style-list.component.html',
  styleUrl: './style-list.component.css'})
export class StyleListComponent implements OnInit {
  private styleService = inject(StyleService);

  styles: Style[] = [];
  filteredStyles: Style[] = [];
  searchTerm = '';
  seasonFilter = '';
  typeFilter = '';
  statusFilter = '';

  ngOnInit() {
    this.loadStyles();
  }

  loadStyles() {
    this.styleService.getStyles().subscribe(data => {
      this.styles = data;
      this.filteredStyles = data;
    });
  }

  filterStyles() {
    this.filteredStyles = this.styles.filter(s => {
      const matchSearch = s.styleName.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                          s.styleCode.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchSeason = !this.seasonFilter || s.season === this.seasonFilter;
      const matchType = !this.typeFilter || s.garmentType === this.typeFilter;
      const matchStatus = !this.statusFilter || s.approvalStatus === this.statusFilter;
      return matchSearch && matchSeason && matchType && matchStatus;
    });
  }

  getStatusClass(status: string) {
    return 'bg-status-' + status.toLowerCase();
  }
}
