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
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  IconButton,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { IoEye, IoEyeOff, IoAdd } from 'react-icons/io5';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

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
   * Handle input changes
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        bio: formData.bio || undefined,
        skills: skills.length > 0 ? skills : undefined,
      });

      navigate('/profile');
    } catch (error: any) {
      const errorMessage = error.message || '회원가입에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="md" py={10}>
      <Box bg="white" p={8} borderRadius="lg" shadow="md">
        <VStack gap={6}>
          <Heading size="lg" color="blue.500">
            회원가입
          </Heading>
          <Text color="gray.600">
            멘토링 매칭 서비스에 가입하세요
          </Text>

          {error && (
            <Box bg="red.50" color="red.500" p={3} borderRadius="md" w="100%">
              {error}
            </Box>
          )}

          <Box as="form" onSubmit={handleSubmit} w="100%">
            <VStack gap={4}>
              <Field label="이메일" required>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="이메일을 입력하세요"
                />
              </Field>

              <Field label="이름" required>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="이름을 입력하세요"
                />
              </Field>

              <Field label="역할" required>
                <Box as="select" 
                     value={formData.role}
                     onChange={(e) => handleInputChange('role', e.target.value)}
                     p={2} borderWidth={1} borderRadius="md" w="100%">
                  <option value="mentee">멘티 (멘토링을 받고 싶어요)</option>
                  <option value="mentor">멘토 (멘토링을 제공하고 싶어요)</option>
                </Box>
              </Field>

              <Field label="비밀번호" required>
                <Box position="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="비밀번호를 입력하세요 (최소 6자)"
                    pr={10}
                  />
                  <Button
                    position="absolute"
                    right={1}
                    top={1}
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <IoEyeOff /> : <IoEye />}
                  </Button>
                </Box>
              </Field>

              <Field label="비밀번호 확인" required>
                <Box position="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                    pr={10}
                  />
                  <Button
                    position="absolute"
                    right={1}
                    top={1}
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <IoEyeOff /> : <IoEye />}
                  </Button>
                </Box>
              </Field>

              <Field label="자기소개">
                <Box as="textarea"
                     value={formData.bio}
                     onChange={(e) => handleInputChange('bio', e.target.value)}
                     placeholder="자신을 소개해주세요"
                     p={2} borderWidth={1} borderRadius="md" w="100%" rows={3} />
              </Field>

              <Field label={`스킬 ${formData.role === 'mentor' ? '(제공 가능한 스킬)' : '(관심 있는 스킬)'}`}>
                <HStack>
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="스킬을 입력하세요 (예: React, Python)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <Button
                    onClick={addSkill}
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                  >
                    <IoAdd />
                  </Button>
                </HStack>
                {skills.length > 0 && (
                  <Flex wrap="wrap" gap={2} mt={2}>
                    {skills.map((skill) => (
                      <Box
                        key={skill}
                        bg="blue.500"
                        color="white"
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="sm"
                        display="flex"
                        alignItems="center"
                        gap={2}
                      >
                        <Text>{skill}</Text>
                        <Button
                          size="xs"
                          variant="ghost"
                          color="white"
                          onClick={() => removeSkill(skill)}
                          p={0}
                          minW="auto"
                          h="auto"
                        >
                          <IoClose />
                        </Button>
                      </Box>
                    ))}
                  </Flex>
                )}
              </Field>

              <Button
                type="submit"
                colorScheme="blue"
                w="100%"
                loading={loading}
              >
                회원가입
              </Button>
            </VStack>
          </Box>

          <Text color="gray.600">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" color="blue.500">
              로그인
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};

export default SignupPage;
