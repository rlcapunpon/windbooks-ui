/**
 * @jest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Landing from './index';

describe('Landing Page - Theme Usage', () => {
  beforeEach(() => {
    // Clear document
    document.head.innerHTML = '';
    document.body.innerHTML = '';

    // Manually inject the CSS custom properties from theme.css
    const style = document.createElement('style');
    style.textContent = `
      :root {
        /* Primary green palette */
        --color-primary: #0ED977;
        --color-primary-hover: #0ED675;
        --color-primary-dark: #088D4D;

        /* Backgrounds */
        --color-background-primary: #FFFFFF;
        --color-background-secondary: #F9F9F9;
        --color-background-surface: #F9F9F9;

        /* Text colors */
        --color-text-primary: #231F20;
        --color-text-secondary: #231F20;
        --color-text-disabled: #A8EFC2;

        /* Border and dividers */
        --color-border: #E0E0E0;
        --color-divider: #E0E0E0;

        /* State colors */
        --color-state-success: #0ED977;
        --color-state-success-dark: #088D4D;
        --color-state-warning: #F59E0B;
        --color-state-error: #EF4444;

        /* Accent colors */
        --color-accent-light: #C7F9CC;
        --color-accent-dark: #073B27;

        /* Input colors */
        --color-input-background: #FFFFFF;
        --color-input-border: #E0E0E0;
        --color-input-focus: #0ED977;
      }

      .btn-primary {
        background-color: var(--color-primary);
        color: #FFFFFF;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 4px 14px 0 rgba(14, 217, 119, 0.25);
      }

      .text-heading {
        color: var(--color-text-primary);
        font-weight: 700;
        font-size: 2rem;
        line-height: 1.2;
      }

      .text-subheading {
        color: var(--color-text-primary);
        font-weight: 600;
        font-size: 1.5rem;
        line-height: 1.3;
      }

      .text-body {
        color: var(--color-text-secondary);
        font-weight: 400;
        font-size: 1rem;
        line-height: 1.6;
      }

      .card {
        background-color: var(--color-background-surface);
        border: 1px solid var(--color-border);
        border-radius: 0.75rem;
        padding: 1.5rem;
        transition: all 0.3s ease;
      }
    `;
    document.head.appendChild(style);
  });

  it('should use theme classes for primary buttons', () => {
    render(
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    );

    // Check that primary action buttons use btn-primary class
    const accessPlatformButton = screen.getByText('Access Platform');
    expect(accessPlatformButton).toHaveClass('btn-primary');

    const createAccountButton = screen.getByText('Create Account');
    expect(createAccountButton).toHaveClass('btn-primary');
  });

  it('should use theme classes for secondary buttons', () => {
    render(
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    );

    // Check that secondary buttons in banner use appropriate styling
    const loginButton = screen.getByText('Login');
    const registerButton = screen.getByText('Register');

    // These should use theme classes instead of hardcoded Tailwind classes
    expect(loginButton).toHaveClass('btn-secondary');
    expect(registerButton).toHaveClass('btn-secondary');
  });

  it('should use theme classes for headings', () => {
    render(
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    );

    // Check that main headings use text-heading class
    const mainHeading = screen.getByText('Tax Operations Simplified');
    expect(mainHeading).toHaveClass('text-heading');

    // Check that section headings use text-subheading class
    const featuresHeading = screen.getByText('Built for DV Consulting Teams');
    expect(featuresHeading).toHaveClass('text-subheading');
  });

  it('should use theme classes for body text', () => {
    render(
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    );

    // Check that body text uses text-body class
    const heroText = screen.getByText(/Our proprietary bookkeeping platform/);
    expect(heroText).toHaveClass('text-body');
  });

  it('should use theme classes for cards', () => {
    render(
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    );

    // Check that stat cards use card class
    const statCards = screen.getAllByText(/30-50%|20-30%|<2%/);
    statCards.forEach(card => {
      // Find the parent card container
      const cardContainer = card.closest('.card');
      expect(cardContainer).toBeInTheDocument();
    });
  });

  it('should use theme colors for background', () => {
    render(
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    );

    // Check that the main container uses theme background color
    const mainContainer = document.querySelector('.min-h-screen');
    expect(mainContainer).toHaveClass('bg-background-primary');
  });
});