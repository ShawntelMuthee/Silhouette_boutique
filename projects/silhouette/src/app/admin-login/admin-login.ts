import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss'
})
export class AdminLogin {
  email = '';
  password = '';

  constructor(private router: Router) {}

  onSubmit() {
    // For demo purposes, let's just redirect to dashboard
    this.router.navigate(['/admin/dashboard']);
  }
}
