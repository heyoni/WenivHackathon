import { create } from 'zustand';
import { authAPI } from '../api/client';

const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  // 초기화 (앱 시작 시 토큰 확인)
  initialize: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const response = await authAPI.me();
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // 회원가입 (회사 생성)
  signup: async (data) => {
    const response = await authAPI.signup(data);
    localStorage.setItem('token', response.data.access_token);
    await get().initialize();
    return response.data;
  },

  // 회사 코드로 가입 신청
  join: async (data) => {
    const response = await authAPI.join(data);
    return response.data;
  },

  // 로그인
  login: async (email, password) => {
    const response = await authAPI.login({ email, password });
    localStorage.setItem('token', response.data.access_token);
    await get().initialize();
    return response.data;
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
