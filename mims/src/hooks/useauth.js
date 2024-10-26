import { useMutation } from '@tanstack/react-query';
import { login } from '../services/api';
import { useAuthStore } from '../store/authstore';

export const useLogin = () => {
  const setUser = useAuthStore(state => state.setUser);
  const setToken = useAuthStore(state => state.setToken);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setUser(data.user);
      setToken(data.token);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};
