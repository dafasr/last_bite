import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import Toast from '../../src/components/Toast';

describe('<Toast />', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders correctly with a message and type', () => {
    const { getByText } = render(
      <Toast message="Test Message" type="success" onHide={() => {}} />
    );
    expect(getByText('Test Message')).toBeTruthy();
  });

  it('calls onHide after animation completes', async () => {
    const onHideMock = jest.fn();
    render(<Toast message="Test Message" type="success" onHide={onHideMock} />);

    jest.advanceTimersByTime(300 + 3000 + 300); // Advance time for fade-in, delay, and fade-out

    await waitFor(() => {
      expect(onHideMock).toHaveBeenCalledTimes(1);
    });
  });

  it('applies correct background color for success type', () => {
    const { getByTestId } = render(
      <Toast message="Success" type="success" onHide={() => {}} />
    );
    const toastContainer = getByTestId('toast-container');
    expect(toastContainer).toHaveStyle({ backgroundColor: '#2ECC71' });
  });

  it('applies correct background color for error type', () => {
    const { getByTestId } = render(
      <Toast message="Error" type="error" onHide={() => {}} />
    );
    const toastContainer = getByTestId('toast-container');
    expect(toastContainer).toHaveStyle({ backgroundColor: '#E74C3C' });
  });
});