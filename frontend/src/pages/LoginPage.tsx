import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  useToast,
  Container,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from '../hooks/useAuth';

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
  const toast = useToast();

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      toast({
        title: '로그인 성공',
        description: '환영합니다!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/profile');
    } catch (error: any) {
      const errorMessage = error.message || '로그인에 실패했습니다.';
      setError(errorMessage);
      toast({
        title: '로그인 실패',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="md" py={20}>
      <Card>
        <CardBody>
          <VStack spacing={6}>
            <Heading size="lg" color="blue.500">
              멘토링 매칭
            </Heading>
            <Text color="gray.600">
              계정에 로그인하세요
            </Text>

            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <Box as="form" onSubmit={handleSubmit} w="100%">
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>이메일</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일을 입력하세요"
                    focusBorderColor="blue.500"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>비밀번호</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="비밀번호를 입력하세요"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      </IconButton>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorPalette="blue"
                  w="100%"
                  loading={loading}
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
        </CardBody>
      </Card>
    </Container>
  );
};

export default LoginPage;
