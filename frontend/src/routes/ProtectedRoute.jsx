import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore              from '../store/authStore'

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const location        = useLocation()

  if (!isAuthenticated) {
    // Redirect to login, remember where they came from
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  return children
}

export default ProtectedRoute