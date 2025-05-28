// Teste unitário para o componente LoginForm do frontend

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import LoginForm from '../../../../src/frontend/src/components/auth/LoginForm';
import { login } from '../../../../src/frontend/src/store/slices/authSlice';

// Mock do Redux
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock das ações
jest.mock('../../../../src/frontend/src/store/slices/authSlice', () => ({
  login: jest.fn(),
}));

describe('LoginForm Component', () => {
  let store;
  
  beforeEach(() => {
    store = mockStore({
      auth: {
        isLoading: false,
        error: null,
      },
    });
    
    // Limpar os mocks antes de cada teste
    jest.clearAllMocks();
  });
  
  it('renders form correctly', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );
    
    // Verificar se os elementos estão presentes no DOM
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByText(/esqueceu sua senha/i)).toBeInTheDocument();
  });
  
  it('should show validation errors for empty fields', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );
    
    // Clicar no botão sem preencher os campos
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Verificar mensagens de erro
    await waitFor(() => {
      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
    });
    
    // Verificar que a ação de login não foi disparada
    expect(login).not.toHaveBeenCalled();
  });
  
  it('should validate email format', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );
    
    // Preencher com email inválido
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' },
    });
    
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'password123' },
    });
    
    // Submeter o formulário
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Verificar mensagem de erro
    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
    
    // Verificar que a ação de login não foi disparada
    expect(login).not.toHaveBeenCalled();
  });
  
  it('should dispatch login action with valid credentials', async () => {
    // Mock da ação de login para retornar uma promise resolvida
    login.mockImplementation(() => {
      return () => Promise.resolve();
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );
    
    // Preencher com dados válidos
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'password123' },
    });
    
    // Submeter o formulário
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Verificar que a ação de login foi disparada com os dados corretos
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
  
  it('should display loading state during login', async () => {
    // Configurar o store com estado de loading
    store = mockStore({
      auth: {
        isLoading: true,
        error: null,
      },
    });
    
    // Mock da ação de login para não resolver imediatamente
    login.mockImplementation(() => {
      return () => new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );
    
    // Preencher com dados válidos
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'password123' },
    });
    
    // Submeter o formulário
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Verificar estado de loading
    expect(screen.getByRole('button', { name: /entrar/i })).toBeDisabled();
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });
  
  it('should display error message when login fails', async () => {
    // Configurar o store com um erro
    store = mockStore({
      auth: {
        isLoading: false,
        error: 'Credenciais inválidas',
      },
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );
    
    // Verificar que a mensagem de erro é exibida
    expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument();
  });
  
  it('should navigate to forgot password page', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );
    
    // Clicar no link "Esqueceu sua senha?"
    fireEvent.click(screen.getByText(/esqueceu sua senha/i));
    
    // Verificar se a navegação aconteceu (simulada com BrowserRouter)
    expect(window.location.pathname).toBe('/recuperar-senha');
  });
});