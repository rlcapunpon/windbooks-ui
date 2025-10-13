import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaxObligationCard from './TaxObligationCard';
import type { OrganizationObligationResponseDto, TaxObligationResponseDto } from '../services/organizationService';

describe('TaxObligationCard Component', () => {
  const mockTaxObligation: TaxObligationResponseDto = {
    id: 'tax-obligation-1',
    code: 'VAT-1606',
    name: 'Monthly Value-Added Tax Return',
    frequency: 'MONTHLY',
    due_rule: { day: 20, month_offset: 1 },
    status: 'MANDATORY',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  };

  const mockOrganizationObligation: OrganizationObligationResponseDto = {
    id: 'org-obligation-1',
    organization_id: 'org-1',
    obligation_id: 'tax-obligation-1',
    start_date: '2024-01-01T00:00:00.000Z',
    end_date: '2024-12-31T00:00:00.000Z',
    status: 'ACTIVE',
    notes: 'Assigned during initial setup',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  };

  it('renders tax obligation code and name', () => {
    render(
      <TaxObligationCard
        organizationObligation={mockOrganizationObligation}
        taxObligation={mockTaxObligation}
      />
    );

    expect(screen.getByText('VAT-1606')).toBeInTheDocument();
    expect(screen.getByText('Monthly Value-Added Tax Return')).toBeInTheDocument();
  });

  it('renders obligation status with correct styling', () => {
    render(
      <TaxObligationCard
        organizationObligation={mockOrganizationObligation}
        taxObligation={mockTaxObligation}
      />
    );

    const statusBadge = screen.getByText('ACTIVE');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800', 'border-green-200');
  });

  it('renders frequency information', () => {
    render(
      <TaxObligationCard
        organizationObligation={mockOrganizationObligation}
        taxObligation={mockTaxObligation}
      />
    );

    expect(screen.getByText('Frequency:')).toBeInTheDocument();
    expect(screen.getByText('MONTHLY')).toBeInTheDocument();
  });

  it('renders start and end dates', () => {
    render(
      <TaxObligationCard
        organizationObligation={mockOrganizationObligation}
        taxObligation={mockTaxObligation}
      />
    );

    expect(screen.getByText('Start Date:')).toBeInTheDocument();
    expect(screen.getByText('End Date:')).toBeInTheDocument();
    
    // Check that both dates are present (there are two "Jan 1, 2024" elements)
    const dateElements = screen.getAllByText('Jan 1, 2024');
    expect(dateElements).toHaveLength(2);
    
    // Check that Dec 31, 2024 is also present
    expect(screen.getByText('Dec 31, 2024')).toBeInTheDocument();
  });

  it('renders last updated date', () => {
    render(
      <TaxObligationCard
        organizationObligation={mockOrganizationObligation}
        taxObligation={mockTaxObligation}
      />
    );

    expect(screen.getByText('Last Updated:')).toBeInTheDocument();
    
    // Check that Jan 1, 2024 appears (both start date and last updated use the same date in mock)
    const dateElements = screen.getAllByText('Jan 1, 2024');
    expect(dateElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders notes when present', () => {
    render(
      <TaxObligationCard
        organizationObligation={mockOrganizationObligation}
        taxObligation={mockTaxObligation}
      />
    );

    expect(screen.getByText('Notes:')).toBeInTheDocument();
    expect(screen.getByText('Assigned during initial setup')).toBeInTheDocument();
  });

  it('does not render notes section when notes are null', () => {
    const obligationWithoutNotes = {
      ...mockOrganizationObligation,
      notes: null
    };

    render(
      <TaxObligationCard
        organizationObligation={obligationWithoutNotes}
        taxObligation={mockTaxObligation}
      />
    );

    expect(screen.queryByText('Notes:')).not.toBeInTheDocument();
  });

  it('does not render end date when null', () => {
    const obligationWithoutEndDate = {
      ...mockOrganizationObligation,
      end_date: null
    };

    render(
      <TaxObligationCard
        organizationObligation={obligationWithoutEndDate}
        taxObligation={mockTaxObligation}
      />
    );

    expect(screen.queryByText('End Date:')).not.toBeInTheDocument();
  });

  it('renders different status colors correctly', () => {
    const statuses = [
      { status: 'ACTIVE', expectedClasses: ['bg-green-100', 'text-green-800', 'border-green-200'] },
      { status: 'DUE', expectedClasses: ['bg-yellow-100', 'text-yellow-800', 'border-yellow-200'] },
      { status: 'OVERDUE', expectedClasses: ['bg-red-100', 'text-red-800', 'border-red-200'] },
      { status: 'FILED', expectedClasses: ['bg-blue-100', 'text-blue-800', 'border-blue-200'] },
      { status: 'PAID', expectedClasses: ['bg-emerald-100', 'text-emerald-800', 'border-emerald-200'] },
      { status: 'EXEMPT', expectedClasses: ['bg-gray-100', 'text-gray-800', 'border-gray-200'] }
    ];

    statuses.forEach(({ status, expectedClasses }) => {
      const obligationWithStatus = {
        ...mockOrganizationObligation,
        status: status as OrganizationObligationResponseDto['status']
      };

      const { rerender } = render(
        <TaxObligationCard
          organizationObligation={obligationWithStatus}
          taxObligation={mockTaxObligation}
        />
      );

      const statusBadge = screen.getByText(status);
      expectedClasses.forEach(className => {
        expect(statusBadge).toHaveClass(className);
      });

      rerender(<div />); // Clean up for next iteration
    });
  });

  it('renders frequency icons correctly', () => {
    const frequencies = [
      { frequency: 'MONTHLY', expectedIcon: '📅' },
      { frequency: 'QUARTERLY', expectedIcon: '📊' },
      { frequency: 'ANNUAL', expectedIcon: '📈' },
      { frequency: 'ONE_TIME', expectedIcon: '🔸' }
    ];

    frequencies.forEach(({ frequency, expectedIcon }) => {
      const taxObligationWithFrequency = {
        ...mockTaxObligation,
        frequency: frequency as TaxObligationResponseDto['frequency']
      };

      const { rerender } = render(
        <TaxObligationCard
          organizationObligation={mockOrganizationObligation}
          taxObligation={taxObligationWithFrequency}
        />
      );

      expect(screen.getByText(expectedIcon)).toBeInTheDocument();

      rerender(<div />); // Clean up for next iteration
    });
  });

  it('has proper card structure and styling', () => {
    render(
      <TaxObligationCard
        organizationObligation={mockOrganizationObligation}
        taxObligation={mockTaxObligation}
      />
    );

    const card = screen.getByText('VAT-1606').closest('.bg-white');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('border', 'border-gray-200', 'rounded-lg', 'p-4', 'shadow-sm', 'hover:shadow-md');
  });
});