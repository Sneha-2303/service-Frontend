// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Token Management
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') localStorage.setItem('access_token', token);
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') return localStorage.getItem('access_token');
  return null;
};

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

// API Request Helper
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getAuthToken();
  
  const headers = new Headers({
    'Content-Type': 'application/json',
  });
  
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      headers.set(key, value as string);
    });
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    clearTokens();
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'API request failed');
  }
  
  return response.json();
};

// Auth APIs
export const login = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }
  
  const data = await response.json();
  setAuthToken(data.access_token);
  return data;
};

export const register = async (userData: {
  username: string;
  password: string;
  email: string;
  mobile: string;
  full_name: string;
  role: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Registration failed');
  }
  
  return response.json();
};

// User APIs
export const getUsers = () => apiRequest('/admin/users');
export const createUser = (userData: any) => apiRequest('/users', { method: 'POST', body: JSON.stringify(userData) });
export const updateUser = (id: number, userData: any) => apiRequest(`/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) });
export const deleteUser = (id: number) => apiRequest(`/users/${id}`, { method: 'DELETE' });
export const getCurrentUser = () => apiRequest('/users/me');

// State, District, City APIs
export const getStates = () => apiRequest('/states');
export const getDistricts = (stateId: number) => apiRequest(`/districts/${stateId}`);
export const getTalukas = () => apiRequest('/talukas');
export const getTalukasByDistrict = (districtId: number) => apiRequest(`/talukas/${districtId}`);
export const createTaluka = (data: any) => apiRequest('/talukas', { method: 'POST', body: JSON.stringify(data) });
export const updateTaluka = (id: number, data: any) => apiRequest(`/talukas/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTaluka = (id: number) => apiRequest(`/talukas/${id}`, { method: 'DELETE' });
export const getLocationHierarchy = () => apiRequest('/locations/hierarchy');

// Machine APIs
export const getMachines = () => apiRequest('/machines');
export const createMachine = (data: any) => apiRequest('/machines', { method: 'POST', body: JSON.stringify(data) });
export const updateMachine = (id: number, data: any) => apiRequest(`/machines/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteMachine = (id: number) => apiRequest(`/machines/${id}`, { method: 'DELETE' });

// Dealer APIs
export const getDealers = () => apiRequest('/dealers');
export const createDealer = (data: any) => apiRequest('/dealers', { method: 'POST', body: JSON.stringify(data) });
export const updateDealer = (id: number, data: any) => apiRequest(`/dealers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteDealer = (id: number) => apiRequest(`/dealers/${id}`, { method: 'DELETE' });

// Customer APIs
export const getCustomers = () => apiRequest('/customers');
export const createCustomer = (data: any) => apiRequest('/customers', { method: 'POST', body: JSON.stringify(data) });
export const updateCustomer = (id: number, data: any) => apiRequest(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCustomer = (id: number) => apiRequest(`/customers/${id}`, { method: 'DELETE' });

// Service Engineer APIs
export const getServiceEngineers = () => apiRequest('/service-engineers');

// Customer Machine APIs
export const getCustomerMachines = () => apiRequest('/customer-machines');
export const createCustomerMachine = (data: any) => apiRequest('/customer-machines', { method: 'POST', body: JSON.stringify(data) });

// Machine Model APIs
export const getAllMachineModels = () => apiRequest('/machine-models');
export const getMachineModels = (machineId: number) => apiRequest(`/machines/${machineId}/models`);

// Complaint Category APIs
export const getComplaintCategories = () => apiRequest('/complaint-categories');
export const createComplaintCategory = (data: any) => apiRequest('/complaint-categories', { method: 'POST', body: JSON.stringify(data) });
export const updateComplaintCategory = (id: number, data: any) => apiRequest(`/complaint-categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteComplaintCategory = (id: number) => apiRequest(`/complaint-categories/${id}`, { method: 'DELETE' });

// Complaint Subcategory APIs
export const getComplaintSubcategories = () => apiRequest('/complaint-subcategories');
export const getComplaintSubcategoriesByCategory = (categoryId: number) => apiRequest(`/complaint-subcategories/category/${categoryId}`);
export const createComplaintSubcategory = (data: any) => apiRequest('/complaint-subcategories', { method: 'POST', body: JSON.stringify(data) });
export const updateComplaintSubcategory = (id: number, data: any) => apiRequest(`/complaint-subcategories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteComplaintSubcategory = (id: number) => apiRequest(`/complaint-subcategories/${id}`, { method: 'DELETE' });

// Complaint APIs
export const getComplaints = () => apiRequest('/complaints');
export const createComplaint = (data: any) => apiRequest('/complaints', { method: 'POST', body: JSON.stringify(data) });
export const updateComplaintStatus = (id: number, status: string) => apiRequest(`/complaints/${id}/status?status=${status}`, { method: 'PUT' });

// Part APIs
export const getParts = () => apiRequest('/parts');
export const createPart = (data: any) => apiRequest('/parts', { method: 'POST', body: JSON.stringify(data) });
export const updatePart = (id: number, data: any) => apiRequest(`/parts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePart = (id: number) => apiRequest(`/parts/${id}`, { method: 'DELETE' });