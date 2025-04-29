// get-started.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-get-started',
  templateUrl: './get-started.component.html',
  styleUrls: ['./get-started.component.css']
})
export class GetStartedComponent implements OnInit {
  
  constructor(private router: Router) { }

  ngOnInit(): void {
    // Any initialization logic can go here
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToSignUp(): void {
    this.router.navigate(['/register']);
  }

  navigateToFeatures(): void {
    // Navigate to features section or page
    // You can implement smooth scrolling to sections if they're on the same page
  }

  getStarted(): void {
    // This could either navigate to sign up or to a product tour
    this.router.navigate(['/register']);
  }

  learnMore(): void {
    // Get the footer element and scroll to it
    const footer = document.querySelector('.footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  }
}