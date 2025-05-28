// Teste de performance usando k6

import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.1.0/index.js';

// Métricas personalizadas
const searchTrend = new Trend('search_duration');
const loginTrend = new Trend('login_duration');
const dashboardTrend = new Trend('dashboard_duration');
const contractTrend = new Trend('contract_duration');
const errorRate = new Rate('error_rate');
const searchRequests = new Counter('search_requests');

// Configuração do teste
export const options = {
  // Cenários de teste
  scenarios: {
    // Teste de carga constante
    constant_load: {
      executor: 'constant-vus',
      vus: 20,
      duration: '30s',
      startTime: '0s',
    },
    // Teste de aumento gradual (ramp-up)
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 30 },
        { duration: '30s', target: 30 },
        { duration: '10s', target: 0 },
      ],
      startTime: '30s',
    },
    // Teste de pico
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5s', target: 50 },
        { duration: '10s', target: 50 },
        { duration: '5s', target: 0 },
      ],
      startTime: '90s',
    },
  },
  // Limites (thresholds)
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% das requisições devem responder em menos de 2s
    search_duration: ['p(95)<1500'],   // 95% das buscas devem responder em menos de 1.5s
    login_duration: ['p(95)<1000'],    // 95% dos logins devem responder em menos de 1s
    dashboard_duration: ['p(95)<2000'], // 95% dos carregamentos de dashboard devem responder em menos de 2s
    contract_duration: ['p(95)<3000'],  // 95% das operações de contrato devem responder em menos de 3s
    error_rate: ['rate<0.01'],         // Taxa de erro menor que 1%
  },
};

// Token de autenticação (simulado)
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// Dados para busca (queries aleatórias)
const searchTerms = [
  'consultoria',
  'contabilidade',
  'marketing',
  'jurídico',
  'ti',
  'recursos humanos',
  'financeiro',
  'treinamento',
  'segurança',
  'design',
];

// Função principal - chamada para cada usuário virtual
export default function() {
  // Headers comuns
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // Headers autenticados
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`,
  };
  
  // Grupo de testes para login
  group('Login', function() {
    // Credenciais de teste
    const payload = JSON.stringify({
      email: 'performance-test@example.com',
      password: 'performance123',
    });
    
    // Medição de tempo para login
    const loginStart = new Date();
    const loginRes = http.post('http://localhost:3001/api/auth/login', payload, { headers });
    const loginDuration = new Date() - loginStart;
    
    // Registrar métricas
    loginTrend.add(loginDuration);
    
    // Verificar resposta
    check(loginRes, {
      'login status is 200': (r) => r.status === 200,
      'login has token': (r) => JSON.parse(r.body).token !== undefined,
    }) || errorRate.add(1);
  });
  
  // Pequena pausa entre operações
  sleep(randomIntBetween(1, 3));
  
  // Grupo de testes para busca de serviços
  group('Search Services', function() {
    // Selecionar termo de busca aleatório
    const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    const searchUrl = `http://localhost:3001/api/services/search?q=${searchTerm}`;
    
    // Contador de requisições de busca
    searchRequests.add(1);
    
    // Medição de tempo para busca
    const searchStart = new Date();
    const searchRes = http.get(searchUrl, { headers });
    const searchDuration = new Date() - searchStart;
    
    // Registrar métricas
    searchTrend.add(searchDuration);
    
    // Verificar resposta
    check(searchRes, {
      'search status is 200': (r) => r.status === 200,
      'search returns results': (r) => {
        const body = JSON.parse(r.body);
        return Array.isArray(body.results) && body.results.length > 0;
      },
    }) || errorRate.add(1);
  });
  
  // Pequena pausa entre operações
  sleep(randomIntBetween(1, 3));
  
  // Grupo de testes para carregamento do dashboard
  group('Dashboard Loading', function() {
    // Medição de tempo para carregamento do dashboard
    const dashboardStart = new Date();
    const dashboardRes = http.get('http://localhost:3001/api/dashboard/client', { headers: authHeaders });
    const dashboardDuration = new Date() - dashboardStart;
    
    // Registrar métricas
    dashboardTrend.add(dashboardDuration);
    
    // Verificar resposta
    check(dashboardRes, {
      'dashboard status is 200': (r) => r.status === 200,
      'dashboard has data': (r) => {
        const body = JSON.parse(r.body);
        return body.services !== undefined && body.metrics !== undefined;
      },
    }) || errorRate.add(1);
  });
  
  // Pequena pausa entre operações
  sleep(randomIntBetween(1, 3));
  
  // Grupo de testes para operações de contrato (mais pesadas)
  group('Contract Operations', function() {
    // Medição de tempo para operações de contrato
    const contractStart = new Date();
    const contractRes = http.get('http://localhost:3001/api/contracts/active', { headers: authHeaders });
    const contractDuration = new Date() - contractStart;
    
    // Registrar métricas
    contractTrend.add(contractDuration);
    
    // Verificar resposta
    check(contractRes, {
      'contract status is 200': (r) => r.status === 200,
      'contract returns data': (r) => {
        const body = JSON.parse(r.body);
        return Array.isArray(body.contracts);
      },
    }) || errorRate.add(1);
  });
  
  // Pausa maior antes do próximo ciclo
  sleep(randomIntBetween(3, 5));
}

// Função executada quando o teste inicia
export function setup() {
  console.log('Iniciando teste de performance...');
  return {};
}

// Função executada quando o teste termina
export function teardown(data) {
  console.log('Teste de performance concluído.');
}