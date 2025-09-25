import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../auth.service';
import { RegisterRequest } from '../../models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.createRegisterForm();
  }

  ngOnInit(): void {
    // Redirect to dashboard if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  private createRegisterForm(): FormGroup {
    return this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9_]+$/) // alphanumeric and underscore only
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Custom validator for password strength
  private passwordStrengthValidator(control: AbstractControl) {
    const password = control.value;
    if (!password) return null;

    const hasNumber = /[0-9]/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasMinLength = password.length >= 6;

    if (hasNumber && hasLetter && hasMinLength) {
      return null; // Valid
    }

    return { passwordStrength: true }; // Invalid
  }

  // Custom validator for password confirmation
  private passwordMatchValidator(group: AbstractControl) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    // Clear the error if passwords match
    if (password === confirmPassword) {
      const confirmPasswordControl = group.get('confirmPassword');
      if (confirmPasswordControl?.hasError('passwordMismatch')) {
        delete confirmPasswordControl.errors?.['passwordMismatch'];
        if (Object.keys(confirmPasswordControl.errors || {}).length === 0) {
          confirmPasswordControl.setErrors(null);
        }
      }
    }

    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    const { confirmPassword, ...registerRequest } = this.registerForm.value;
    const request: RegisterRequest = registerRequest;

    this.authService.register(request).subscribe({
      next: (response) => {
        this.snackBar.open('Registration successful! Welcome aboard!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(field => {
      const control = this.registerForm.get(field);
      if (control) {
        control.markAsTouched({ onlySelf: true });
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);

    if (field?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }

    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `${this.getFieldDisplayName(fieldName)} must be at least ${minLength} characters`;
    }

    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `${this.getFieldDisplayName(fieldName)} cannot exceed ${maxLength} characters`;
    }

    if (field?.hasError('pattern') && fieldName === 'username') {
      return 'Username can only contain letters, numbers, and underscores';
    }

    if (field?.hasError('passwordStrength')) {
      return 'Password must contain at least one letter and one number';
    }

    if (field?.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }

    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      username: 'Username',
      password: 'Password',
      confirmPassword: 'Confirm Password'
    };
    return displayNames[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getPasswordStrengthClass(): string {
    const password = this.registerForm.get('password')?.value;
    if (!password) return '';

    const hasNumber = /[0-9]/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasMinLength = password.length >= 6;
    const hasLongLength = password.length >= 8;
    const hasSpecialChar = /[!@#$%^&*(),.?\":{}|<>]/.test(password);

    let strength = 0;
    if (hasMinLength) strength++;
    if (hasNumber) strength++;
    if (hasLetter) strength++;
    if (hasLongLength) strength++;
    if (hasSpecialChar) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}