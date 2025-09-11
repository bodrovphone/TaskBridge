// Authentication is currently disabled
export function useAuth() {
  return {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    session: null,
  }
}
