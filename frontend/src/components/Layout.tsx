import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Button,
  useColorModeValue,
  Container,
  Heading,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout component with navigation and user menu
 * @param children - The content to render inside the layout
 * @returns {JSX.Element} The layout component
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast({
        title: '로그아웃 완료',
        description: '성공적으로 로그아웃되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: '로그아웃 실패',
        description: '로그아웃 중 오류가 발생했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Header */}
      <Box bg={bg} borderBottom="1px" borderColor={borderColor} px={4}>
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <Heading size="md" color="blue.500">
            멘토링 매칭
          </Heading>

          <HStack spacing={4}>
            {/* Navigation Links */}
            {user?.role === 'mentee' && (
              <Button as={Link} to="/mentors" variant="ghost">
                멘토 찾기
              </Button>
            )}
            <Button as={Link} to="/requests" variant="ghost">
              {user?.role === 'mentor' ? '매칭 요청' : '내 요청'}
            </Button>

            {/* User Menu */}
            <Menu>
              <MenuButton>
                <Avatar size="sm" name={user?.name} />
              </MenuButton>
              <MenuList>
                <MenuItem as={Link} to="/profile">
                  프로필
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  로그아웃
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Box>

      {/* Main Content */}
      <Container maxW="container.xl" py={8}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
