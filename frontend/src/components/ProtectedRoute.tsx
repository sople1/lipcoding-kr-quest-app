import React from 'react';
import { Navigate } from 'react-router-dom';
import { Spinner, Center } from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route component that requires authentication
 * @param children - The content to render if authenticated
 * @returns {JSX.Element} The protected content or redirect to login
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
