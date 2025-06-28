import React, { useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  Button,
  Container,
  Heading,
  Text,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

// Simple toast function for Chakra UI v3
const showToast = (title: string, description: string, status: 'success' | 'error') => {
  console.log(`[${status.toUpperCase()}] ${title}: ${description}`);
  alert(`${title}: ${description}`);
};

/**
 * Layout component with navigation and user menu
 * @param children - The content to render inside the layout
 * @returns {JSX.Element} The layout component
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await logout();
      showToast(
        '로그아웃 완료',
        '성공적으로 로그아웃되었습니다.',
        'success'
      );
      navigate('/login');
    } catch (error) {
      showToast(
        '로그아웃 실패',
        '로그아웃 중 오류가 발생했습니다.',
        'error'
      );
    }
  };

  const bg = 'white';
  const borderColor = 'gray.200';

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Navigation Header */}
      <Box bg={bg} borderBottomWidth="1px" borderColor={borderColor} boxShadow="sm">
        <Container maxW="7xl">
          <Flex h={16} alignItems="center" justifyContent="space-between">
            <Heading size="md" color="blue.500">
              멘토링 매칭
            </Heading>

            <HStack gap={4}>
              {user?.role === 'mentee' && (
                <Button asChild variant="ghost">
                  <Link to="/mentors">멘토 찾기</Link>
                </Button>
              )}
              <Button asChild variant="ghost">
                <Link to="/requests">매칭 요청</Link>
              </Button>

              {/* User Menu */}
              <Box position="relative">
                <Button
                  variant="ghost"
                  onClick={() => setShowMenu(!showMenu)}
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <Box
                    width="32px"
                    height="32px"
                    borderRadius="full"
                    bg="blue.100"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FaUser color="blue" />
                  </Box>
                  {user?.name}
                </Button>

                {showMenu && (
                  <Box
                    position="absolute"
                    top="100%"
                    right="0"
                    mt={2}
                    bg="white"
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    boxShadow="lg"
                    zIndex={1000}
                    minW="150px"
                  >
                    <Button
                      asChild
                      variant="ghost"
                      w="100%"
                      justifyContent="flex-start"
                      onClick={() => setShowMenu(false)}
                    >
                      <Link to="/profile">프로필</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      w="100%"
                      justifyContent="flex-start"
                      onClick={() => {
                        setShowMenu(false);
                        handleLogout();
                      }}
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <FaSignOutAlt />
                      로그아웃
                    </Button>
                  </Box>
                )}
              </Box>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="7xl" py={8}>
        {children}
      </Container>

      {/* Click outside to close menu */}
      {showMenu && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          zIndex={999}
          onClick={() => setShowMenu(false)}
        />
      )}
    </Box>
  );
};

export default Layout;
