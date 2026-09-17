import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Welcome to BondWave message', () => {
  render(<App />);
  const welcomeMessage = screen.getByText(/Welcome to BondWave/i);
  expect(welcomeMessage).toBeInTheDocument();
});
