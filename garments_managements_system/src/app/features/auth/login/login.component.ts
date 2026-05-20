import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);

  loginForm: FormGroup;
  isLoading = false;
  returnUrl: string;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: (user) => {
          if (user) {
            this.notify.success(`Welcome back, ${user.fullName}`);
            this.router.navigateByUrl(this.returnUrl);
          } else {
            this.notify.error('Invalid email or password');
          }
          this.isLoading = false;
        },
        error: () => {
          this.notify.error('Login failed. Please try again.');
          this.isLoading = false;
        }
      });
    }
  }

  quickLogin(role: string) {
    const emailMap: { [key: string]: string } = {
      admin: 'admin@garments.com',
      merch: 'merch@garments.com',
      prod: 'prod@garments.com',
      qa: 'qa@garments.com'
    };
    const email = emailMap[role] || `${role}@garments.com`;
    this.loginForm.patchValue({ email, password: 'password123' });
    this.onSubmit();
  }
}
