// The base URL of your FastAPI backend
const API_URL = "http://127.0.0.1:8000";

// Helper function to get the auth token from local storage
const getToken = () => localStorage.getItem("token");

// Main function to handle API requests
const apiService = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body: Record<string, any> | null = null,
  isFormData: boolean = false
) => {
  const token = getToken();
  
  // Set up headers
  const headers = new Headers();
  if (!isFormData) {
    headers.append("Content-Type", "application/json");
  }
  
  // Add auth token if we have one
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  // Set up config
  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = isFormData ? (body as unknown as FormData) : JSON.stringify(body);
  }

  // Make the request
  const response = await fetch(`${API_URL}${endpoint}`, config);

  // Handle errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "An unknown error occurred" }));
    throw new Error(errorData.detail || "API request failed");
  }

  // Handle empty responses (like 204 No Content)
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// Export convenience methods
export const api = {
  get: (endpoint: string) => apiService(endpoint, "GET"),
  post: (endpoint: string, body: Record<string, any>, isFormData = false) => apiService(endpoint, "POST", body, isFormData),
  put: (endpoint: string, body: Record<string, any>) => apiService(endpoint, "PUT", body),
  del: (endpoint: string) => apiService(endpoint, "DELETE"),
  
  // --- THIS IS THE FIX ---
  // Updated to handle URLSearchParams as requested by AuthContext
  login: async (formData: URLSearchParams) => {
    
    // FastAPI's OAuth2PasswordRequestForm also accepts this content type
    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: headers, // Use the new headers
        body: formData,     // Send URLSearchParams directly
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
    }
    
    return response.json();
  }
};