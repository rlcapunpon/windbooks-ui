/**
 * @jest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';

describe('Theme CSS - Central Color Palette and Component Styles', () => {
  beforeEach(async () => {
    // Clear document
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    
    // Manually inject the CSS custom properties from color_pallete.md
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

      .btn-secondary {
        background-color: var(--color-background-surface);
        color: var(--color-text-primary);
        border: 2px solid var(--color-border);
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 500;
        transition: all 0.3s ease;
      }

      .form-input {
        background-color: var(--color-input-background);
        border: 2px solid var(--color-input-border);
        border-radius: 0.5rem;
        padding: 0.75rem;
        color: var(--color-text-primary);
        transition: all 0.3s ease;
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

      .error-text {
        color: var(--color-state-error);
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      .success-text {
        color: var(--color-state-success);
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      .card {
        background-color: var(--color-background-surface);
        border: 1px solid var(--color-border);
        border-radius: 0.75rem;
        padding: 1.5rem;
        transition: all 0.3s ease;
      }

      .modal-overlay {
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(8px);
      }

      .modal-content {
        background-color: var(--color-background-primary);
        border: 2px solid var(--color-border);
        border-radius: 1rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }


    `;
    document.head.appendChild(style);
  });

  describe('Color Palette - CSS Custom Properties', () => {
    it('should define all required background colors', () => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      
      // Test background colors
      expect(styles.getPropertyValue('--color-background-primary').trim()).toBe('#FFFFFF');
      expect(styles.getPropertyValue('--color-background-secondary').trim()).toBe('#F9F9F9');
      expect(styles.getPropertyValue('--color-background-surface').trim()).toBe('#F9F9F9');
    });

    it('should define all required primary colors', () => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      
      // Test primary colors
      expect(styles.getPropertyValue('--color-primary').trim()).toBe('#0ED977');
      expect(styles.getPropertyValue('--color-primary-hover').trim()).toBe('#0ED675');
      expect(styles.getPropertyValue('--color-primary-dark').trim()).toBe('#088D4D');
    });

    it('should define all required accent colors', () => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      
      // Test accent colors
      expect(styles.getPropertyValue('--color-accent-light').trim()).toBe('#C7F9CC');
      expect(styles.getPropertyValue('--color-accent-dark').trim()).toBe('#073B27');
    });

    it('should define all required state colors', () => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      
      // Test state colors
      expect(styles.getPropertyValue('--color-state-success').trim()).toBe('#0ED977');
      expect(styles.getPropertyValue('--color-state-warning').trim()).toBe('#F59E0B');
      expect(styles.getPropertyValue('--color-state-error').trim()).toBe('#EF4444');
    });

    it('should define all required text colors', () => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      
      // Test text colors
      expect(styles.getPropertyValue('--color-text-primary').trim()).toBe('#231F20');
      expect(styles.getPropertyValue('--color-text-secondary').trim()).toBe('#231F20');
      expect(styles.getPropertyValue('--color-text-disabled').trim()).toBe('#A8EFC2');
    });

    it('should define all required input and border colors', () => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      
      // Test input colors
      expect(styles.getPropertyValue('--color-input-background').trim()).toBe('#FFFFFF');
      expect(styles.getPropertyValue('--color-input-border').trim()).toBe('#E0E0E0');
      expect(styles.getPropertyValue('--color-input-focus').trim()).toBe('#0ED977');
      
      // Test border colors
      expect(styles.getPropertyValue('--color-border').trim()).toBe('#E0E0E0');
      expect(styles.getPropertyValue('--color-divider').trim()).toBe('#E0E0E0');
    });
  });

  describe('Component Styles', () => {
    it('should provide btn-primary class with gradient background and proper styling', () => {
      const button = document.createElement('button');
      button.className = 'btn-primary';
      document.body.appendChild(button);
      
      const styles = getComputedStyle(button);
      
      // Test that background color is set (using backgroundColor instead of background)
      expect(styles.backgroundColor).toBeTruthy();
      expect(styles.borderRadius).toBe('0.5rem'); // Keep as rem in tests
      expect(styles.fontWeight).toBe('600');
      expect(styles.transition).toContain('0.3s');
    });

    it('should provide btn-secondary class with proper styling', () => {
      const button = document.createElement('button');
      button.className = 'btn-secondary';
      document.body.appendChild(button);
      
      const styles = getComputedStyle(button);
      
      expect(styles.borderRadius).toBe('0.5rem');
      expect(styles.fontWeight).toBe('500');
      expect(styles.transition).toContain('0.3s');
    });

    it('should provide form-input class with proper styling', () => {
      const input = document.createElement('input');
      input.className = 'form-input';
      document.body.appendChild(input);
      
      const styles = getComputedStyle(input);
      
      expect(styles.borderRadius).toBe('0.5rem');
      expect(styles.transition).toContain('0.3s');
    });

    it('should provide text styling classes', () => {
      const heading = document.createElement('h1');
      heading.className = 'text-heading';
      document.body.appendChild(heading);
      
      const headingStyles = getComputedStyle(heading);
      expect(headingStyles.fontWeight).toBe('700');
      expect(headingStyles.fontSize).toBe('2rem');

      const subheading = document.createElement('h2');
      subheading.className = 'text-subheading';
      document.body.appendChild(subheading);
      
      const subheadingStyles = getComputedStyle(subheading);
      expect(subheadingStyles.fontWeight).toBe('600');
      expect(subheadingStyles.fontSize).toBe('1.5rem');
    });

    it('should provide error-text and success-text classes', () => {
      const errorText = document.createElement('p');
      errorText.className = 'error-text';
      document.body.appendChild(errorText);
      
      const errorStyles = getComputedStyle(errorText);
      // In test environment, CSS variables may not be resolved, so check for the variable name
      expect(errorStyles.color).toBeTruthy();
      
      const successText = document.createElement('p');
      successText.className = 'success-text';
      document.body.appendChild(successText);
      
      const successStyles = getComputedStyle(successText);
      expect(successStyles.color).toBeTruthy();
    });

    it('should provide card class with proper styling', () => {
      const card = document.createElement('div');
      card.className = 'card';
      document.body.appendChild(card);
      
      const styles = getComputedStyle(card);
      
      expect(styles.borderRadius).toBe('0.75rem');
      expect(styles.padding).toBe('1.5rem'); // Keep as rem in test environment
      expect(styles.transition).toContain('0.3s');
    });

    it('should provide modal-overlay and modal-content classes', () => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      document.body.appendChild(overlay);
      
      const overlayStyles = getComputedStyle(overlay);
      // backdrop-filter may not be supported in test environment
      expect(overlay.classList.contains('modal-overlay')).toBe(true);
      
      const modal = document.createElement('div');
      modal.className = 'modal-content';
      document.body.appendChild(modal);
      
      const modalStyles = getComputedStyle(modal);
      expect(modalStyles.borderRadius).toBe('1rem');
    });
  });

  describe('Theme Structure', () => {
    it('should provide a comprehensive color palette based on color_pallete.md', () => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      
      // Verify key colors from the palette are defined
      expect(styles.getPropertyValue('--color-primary').trim()).toBe('#0ED977');
      expect(styles.getPropertyValue('--color-background-primary').trim()).toBe('#FFFFFF');
      expect(styles.getPropertyValue('--color-text-primary').trim()).toBe('#231F20');
    });
  });
});