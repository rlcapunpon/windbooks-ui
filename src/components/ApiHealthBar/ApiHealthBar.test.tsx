import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ApiHealthBar } from './ApiHealthBar';
import { getApiHealthUrl, getOrgApiHealthUrl } from '../../utils/env';

// Mock the environment utilities
vi.mock('../../utils/env', () => ({
  getApiHealthUrl: vi.fn(() => 'http://localhost:3000/health'),
  getOrgApiHealthUrl: vi.fn(() => 'http://localhost:3001/health'),
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ApiHealthBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default successful health responses
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ status: 'healthy' }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render the health bar expanded by default', async () => {
      await act(async () => {
        render(<ApiHealthBar />);
      });

      expect(screen.getByText('API Health Status')).toBeInTheDocument();
      expect(screen.getByText('AUTH API')).toBeInTheDocument();
      expect(screen.getByText('ORG API')).toBeInTheDocument();
    });

    it('should show minimize button when expanded', async () => {
      await act(async () => {
        render(<ApiHealthBar />);
      });

      const minimizeButton = screen.getByRole('button', { name: /minimize/i });
      expect(minimizeButton).toBeInTheDocument();
      // Button should not contain text, only icon
      expect(minimizeButton).not.toHaveTextContent(/minimize/i);
    });

    it('should show refresh button', async () => {
      await act(async () => {
        render(<ApiHealthBar />);
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();
      // Button should not contain text, only icon
      expect(refreshButton).not.toHaveTextContent(/refresh/i);
    });
  });

  describe('Minimization', () => {
    it('should show bulb icon when minimized', async () => {
      await act(async () => {
        render(<ApiHealthBar />);
      });

      const minimizeButton = screen.getByRole('button', { name: /minimize/i });
      fireEvent.click(minimizeButton);

      await waitFor(() => {
        expect(screen.getByTestId('health-bulb-icon')).toBeInTheDocument();
      });

      expect(screen.queryByText('API Health Status')).not.toBeInTheDocument();
    });

    it('should show maximize button when minimized', async () => {
      await act(async () => {
        render(<ApiHealthBar />);
      });

      const minimizeButton = screen.getByRole('button', { name: /minimize/i });
      fireEvent.click(minimizeButton);

      await waitFor(() => {
        const maximizeButton = screen.getByRole('button', { name: /maximize/i });
        expect(maximizeButton).toBeInTheDocument();
        // Button should not contain text, only icon
        expect(maximizeButton).not.toHaveTextContent(/maximize/i);
      });
    });

    it('should expand when maximize button is clicked', async () => {
      await act(async () => {
        render(<ApiHealthBar />);
      });

      // Minimize first
      const minimizeButton = screen.getByRole('button', { name: /minimize/i });
      fireEvent.click(minimizeButton);

      await waitFor(() => {
        expect(screen.getByTestId('health-bulb-icon')).toBeInTheDocument();
      });

      // Maximize
      const maximizeButton = screen.getByRole('button', { name: /maximize/i });
      fireEvent.click(maximizeButton);

      await waitFor(() => {
        expect(screen.getByText('API Health Status')).toBeInTheDocument();
      });
    });
  });

  describe('Health Status Display', () => {
    it('should display healthy status for both APIs when both are healthy', async () => {
      await act(async () => {
        render(<ApiHealthBar />);
      });

      await waitFor(() => {
        const healthyStatuses = screen.getAllByText('Healthy');
        expect(healthyStatuses).toHaveLength(2); // One for each API
      });
    });

    it('should display unhealthy status when API returns error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        render(<ApiHealthBar />);
      });

      await waitFor(() => {
        expect(screen.getByText('Unhealthy')).toBeInTheDocument();
      });
    });

    it('should display unhealthy status when API returns non-200 status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' }),
      });

      await act(async () => {
        render(<ApiHealthBar />);
      });

      await waitFor(() => {
        expect(screen.getByText('Unhealthy')).toBeInTheDocument();
      });
    });
  });

  describe('Polling', () => {
    it('should poll health status every 30 seconds', async () => {
      vi.useFakeTimers();

      await act(async () => {
        render(<ApiHealthBar />);
      });

      // Initial call
      expect(mockFetch).toHaveBeenCalledTimes(2); // One for each API

      // Fast forward 30 seconds
      await act(async () => {
        vi.advanceTimersByTime(30000);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(4); // Two more calls (one for each API)
      });

      vi.useRealTimers();
    });
  });

  describe('Manual Refresh', () => {
    it('should refresh health status when refresh button is clicked', async () => {
      await act(async () => {
        render(<ApiHealthBar />);
      });

      // Initial calls
      expect(mockFetch).toHaveBeenCalledTimes(2);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(4); // Two additional calls
      });
    });
  });

  describe('Grid Layout', () => {
    it('should display APIs in a grid layout', async () => {
      await act(async () => {
        render(<ApiHealthBar />);
      });

      const gridContainer = screen.getByTestId('api-health-grid');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass('grid');
    });

    it('should have two cards in the grid', async () => {
      await act(async () => {
        render(<ApiHealthBar />);
      });

      const cards = screen.getAllByTestId('api-health-card');
      expect(cards).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await act(async () => {
        render(<ApiHealthBar />);
      });

      await waitFor(() => {
        const unhealthyStatuses = screen.getAllByText('Unhealthy');
        expect(unhealthyStatuses).toHaveLength(2);
      });
    });

    it('should continue polling even after errors', async () => {
      vi.useFakeTimers();

      mockFetch.mockRejectedValue(new Error('Network error'));

      await act(async () => {
        render(<ApiHealthBar />);
      });

      // Initial failed calls
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      // Fast forward 30 seconds - should still poll
      await act(async () => {
        vi.advanceTimersByTime(30000);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(4);
      });

      vi.useRealTimers();
    });
  });
});