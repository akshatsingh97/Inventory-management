import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App Component', () => {
    test('renders the initial UI', () => {
        render(<App/>);
        expect(screen.getByText(/hello/i)).toBeInTheDocument();
        expect(screen.getByText(/0/)).toBeInTheDocument();
        expect(screen.getByText(/increase/i)).toBeInTheDocument();
        expect(screen.getByText(/decrement/i)).toBeInTheDocument();
    });

    test('increments the counter on clicking "Increase" button', () => {
        render(<App/>);
        const increaseButton = screen.getByText(/increase/i);
        fireEvent.click(increaseButton);
        fireEvent.click(increaseButton);
        expect(screen.getByText(/2/)).toBeInTheDocument();
    });

    test('decrement the counter on clicking "Decrement" button', () => {
        render(<App/>);

        const increaseButton = screen.getByText(/increase/i);
        const decreaseButton = screen.getByText(/decrement/i);

        fireEvent.click(increaseButton);
        fireEvent.click(increaseButton);

        fireEvent.click(decreaseButton);

        expect(screen.getByText(/1/)).toBeInTheDocument();
    })

    test('handles decrementing when count is 0', () => {
        render(<App/>);

        const decreaseButton = screen.getByText(/decrement/i);

        fireEvent.click(decreaseButton);

        expect(screen.getByText(/-1/)).toBeInTheDocument();
    })
})