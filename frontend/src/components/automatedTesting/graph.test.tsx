import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OpenSimulation from '../pages/open_simulation'; 
import { BrowserRouter as Router } from 'react-router-dom';

describe('OpenSimulation Component', () => {
  it('renders a graph when a chart button is clicked', () => {
    render(
      <Router>
        <OpenSimulation />
      </Router>
    );

    // Initially, no graph is rendered yet
    expect(screen.queryByTestId('line-chart')).toBeNull(); 

    fireEvent.click(screen.getByText(/Line Chart/i));

    // Check if a Line Chart is rendered
    expect(screen.getByTestId('line-chart')).toBeInTheDocument(); 

    // Simulate clicking the "Shaded Line Chart" button
    fireEvent.click(screen.getByText(/Shaded Line Chart/i));

    // Check if the Shaded Line Chart is rendered
    expect(screen.getByTestId('shaded-line-chart')).toBeInTheDocument(); 

    // Simulate clicking the "Stacked Bar Chart" button
    fireEvent.click(screen.getByText(/Stacked Bar Chart/i));

    // Check if the Stacked Bar Chart is rendered
    expect(screen.getByTestId('stacked-bar-chart')).toBeInTheDocument(); 
  });
});
