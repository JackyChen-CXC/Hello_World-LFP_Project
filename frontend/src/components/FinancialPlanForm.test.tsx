import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreatePlan from './pages/create_plan';

describe('FinancialPlanForm', () => {
  xit('renders correctly', () => {
    render(<CreatePlan />);
    expect(screen.getByText(/Create Financial Plan/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter plan name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Plan/i })).toBeInTheDocument();
  });

  xit('should update input value when typing', () => {
    render(<CreatePlan />);
    const input = screen.getByPlaceholderText(/Enter plan name/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Retirement Plan' } });
    expect(input.value).toBe('Retirement Plan');
  });

  xit('should display an alert when the form is submitted', () => {
    window.alert = jest.fn();
    render(<CreatePlan />);
    const input = screen.getByPlaceholderText(/Enter plan name/i);
    const button = screen.getByRole('button', { name: /Create Plan/i });
    fireEvent.change(input, { target: { value: 'Retirement Plan' } });
    fireEvent.click(button);
    expect(window.alert).toHaveBeenCalledWith('Plan created: Retirement Plan');
  });
});