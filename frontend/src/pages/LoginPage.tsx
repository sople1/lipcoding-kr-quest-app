import React, { useState } from 'react';
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  Container,
  HStack,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

// Simple toast function for Chakra UI v3
const showToast = (title: string, description: string, status: 'success' | 'error') => {
  console.log(`[${status.toUpperCase()}] ${title}: ${description}`);
  alert(`${title}: ${description}`);
};

/**
 * Login page component
 * @returns {JSX.Element} The login page
 */
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      showToast(
        '로그인 성공',
        '환영합니다!',
        'success'
      );
      navigate('/profile');
    } catch (error: any) {
      const errorMessage = error.message || '로그인에 실패했습니다.';
      setError(errorMessage);
      showToast(
        '로그인 실패',
        errorMessage,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="md" py={20}>
      <Box bg="white" p={8} borderRadius="lg" shadow="md" border="1px" borderColor="gray.200">
        <VStack gap={6}>
          <Heading size="lg" color="blue.500">
            멘토링 매칭
          </Heading>
          <Text color="gray.600">
            계정에 로그인하세요
          </Text>

          {error && (
            <Box bg="red.50" p={4} borderRadius="md" borderLeft="4px" borderLeftColor="red.400" w="100%">
              <HStack>
                <FaExclamationTriangle color="red" />
                <Text color="red.700">{error}</Text>
              </HStack>
            </Box>
          )}

          <Box as="form" onSubmit={handleSubmit} w="100%">
            <VStack gap={4}>
              <Box w="100%">
                <Text mb={2} fontWeight="medium">이메일</Text>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                  required
                />
              </Box>

              <Box w="100%">
                <Text mb={2} fontWeight="medium">비밀번호</Text>
                <Box position="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    required
                    paddingRight="48px"
                  />
                  <Button
                    position="absolute"
                    right="8px"
                    top="50%"
                    transform="translateY(-50%)"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </Box>
              </Box>

              <Button
                type="submit"
                colorPalette="blue"
                w="100%"
                loading={loading}
                mt={4}
              >
                로그인
              </Button>
            </VStack>
          </Box>

          <Text color="gray.600">
            계정이 없으신가요?{' '}
            <Link asChild color="blue.500">
              <RouterLink to="/signup">회원가입</RouterLink>
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};

export default LoginPage;
