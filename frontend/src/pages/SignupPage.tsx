import React, { useState } from 'react';
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Text,
  Container,
  HStack,
  Flex,
  Select,
  Textarea,
  Badge,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaPlus, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

// Simple toast function for Chakra UI v3
const showToast = (title: string, description: string, status: 'success' | 'error') => {
  console.log(`[${status.toUpperCase()}] ${title}: ${description}`);
  alert(`${title}: ${description}`);
};

/**
 * Signup page component
 * @returns {JSX.Element} The signup page
 */
const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'mentee' as UserRole,
    bio: '',
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  /**
   * Handle input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Add skill to the list
   */
  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills(prev => [...prev, skillInput.trim()]);
      setSkillInput('');
    }
  };

  /**
   * Remove skill from the list
   */
  const removeSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(skill => skill !== skillToRemove));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      setLoading(false);
      return;
    }

    try {
      await signup({
        ...formData,
        skills: formData.role === 'mentor' ? skills : undefined,
      });
      
      showToast(
        '회원가입 성공',
        '계정이 생성되었습니다. 로그인해주세요.',
        'success'
      );
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.message || '회원가입에 실패했습니다.';
      setError(errorMessage);
      showToast(
        '회원가입 실패',
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
            회원가입
          </Heading>
          <Text color="gray.600">
            멘토링 매칭에 참여하세요
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
                <Text mb={2} fontWeight="medium">이름</Text>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="이름을 입력하세요"
                  required
                />
              </Box>

              <Box w="100%">
                <Text mb={2} fontWeight="medium">이메일</Text>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="이메일을 입력하세요"
                  required
                />
              </Box>

              <Box w="100%">
                <Text mb={2} fontWeight="medium">역할</Text>
                <select
                  name="role"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="mentee">멘티 (멘토링을 받고 싶어요)</option>
                  <option value="mentor">멘토 (멘토링을 제공하고 싶어요)</option>
                </select>
              </Box>

              {formData.role === 'mentor' && (
                <Box w="100%">
                  <Text mb={2} fontWeight="medium">제공 가능한 스킬</Text>
                  <HStack mb={2}>
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="스킬을 입력하세요"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button onClick={addSkill} size="sm" colorPalette="blue">
                      <FaPlus />
                    </Button>
                  </HStack>
                  {skills.length > 0 && (
                    <Flex flexWrap="wrap" gap={2}>
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          colorPalette="blue"
                          size="sm"
                          borderRadius="full"
                          px={2}
                          py={1}
                          cursor="pointer"
                          onClick={() => removeSkill(skill)}
                        >
                          {skill} <FaTimes size="10" style={{ marginLeft: '4px' }} />
                        </Badge>
                      ))}
                    </Flex>
                  )}
                </Box>
              )}

              <Box w="100%">
                <Text mb={2} fontWeight="medium">자기소개</Text>
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="자신을 소개해주세요"
                  rows={4}
                />
              </Box>

              <Box w="100%">
                <Text mb={2} fontWeight="medium">비밀번호</Text>
                <Box position="relative">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
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

              <Box w="100%">
                <Text mb={2} fontWeight="medium">비밀번호 확인</Text>
                <Box position="relative">
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="비밀번호를 다시 입력하세요"
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
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
                회원가입
              </Button>
            </VStack>
          </Box>

          <Text color="gray.600">
            이미 계정이 있으신가요?{' '}
            <Text as="span" color="blue.500" cursor="pointer">
              <RouterLink to="/login">로그인</RouterLink>
            </Text>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};

export default SignupPage;
