import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authService from '../services/auth.service'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────────
      user:         null,
      accessToken:  null,
      refreshToken: null,
      isLoading:    false,
      error:        null,

      // ── Computed ───────────────────────────────
      isAuthenticated: () => !!get().accessToken && !!get().user,

      // ── Actions ────────────────────────────────

      register: async (username, email, password) => {
        set({ isLoading: true, error: null })
        try {
          const data = await authService.register({ username, email, password })
          set({
            user:         data.user,
            accessToken:  data.accessToken,
            refreshToken: data.refreshToken,
            isLoading:    false,
          })
          return { success: true }
        } catch (err) {
          const message = err.response?.data?.message || 'Registration failed'
          set({ error: message, isLoading: false })
          return { success: false, message }
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const data = await authService.login({ email, password })
          set({
            user:         data.user,
            accessToken:  data.accessToken,
            refreshToken: data.refreshToken,
            isLoading:    false,
          })
          return { success: true }
        } catch (err) {
          const message = err.response?.data?.message || 'Login failed'
          set({ error: message, isLoading: false })
          return { success: false, message }
        }
      },

      logout: async () => {
        try {
          await authService.logout()
        } catch {
          // Logout locally even if API call fails
        } finally {
          set({
            user:         null,
            accessToken:  null,
            refreshToken: null,
            error:        null,
          })
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return false
        try {
          const data = await authService.refresh(refreshToken)
          set({ accessToken: data.accessToken })
          return true
        } catch {
          // Refresh failed — log user out
          set({
            user:         null,
            accessToken:  null,
            refreshToken: null,
          })
          return false
        }
      },

      setUser: (user) => set({ user }),
      clearError: ()  => set({ error: null }),
    }),

    {
      name:    'capytoons-auth',  // localStorage key
      partialize: (state) => ({   // only persist these fields
        user:         state.user,
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)

export default useAuthStore