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
  useToast,
  Card,
  CardBody,
  CardHeader,
  Avatar,
  HStack,
  Badge,
  Textarea,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  InputGroup,
  InputRightElement,
  IconButton,
  Divider,
  Stack,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FaEdit, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

/**
 * Profile page component
 * @returns {JSX.Element} The profile page
 */
const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
  });
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  
  const toast = useToast();

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
   * Start editing profile
   */
  const startEditing = () => {
    setFormData({
      name: user?.name || '',
      bio: user?.bio || '',
    });
    setSkills(user?.skills || []);
    setIsEditing(true);
    setError('');
  };

  /**
   * Cancel editing
   */
  const cancelEditing = () => {
    setIsEditing(false);
    setError('');
    setFormData({
      name: user?.name || '',
      bio: user?.bio || '',
    });
    setSkills(user?.skills || []);
  };

  /**
   * Save profile changes
   */
  const saveProfile = async () => {
    setLoading(true);
    setError('');

    try {
      await api.put('/profile', {
        name: formData.name,
        bio: formData.bio,
        skills: skills,
      });

      await refreshUser();
      setIsEditing(false);
      
      toast({
        title: '프로필 업데이트 성공',
        description: '프로필이 성공적으로 업데이트되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      const errorMessage = error.message || '프로필 업데이트에 실패했습니다.';
      setError(errorMessage);
      toast({
        title: '프로필 업데이트 실패',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box textAlign="center" py={10}>
        <Text>사용자 정보를 불러오는 중...</Text>
      </Box>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      <Heading size="lg">프로필</Heading>

      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <HStack gap={4}>
              <Avatar size="lg" name={user.name} />
              <Box>
                <Heading size="md">{user.name}</Heading>
                <Text color="gray.600">{user.email}</Text>
                <Badge
                  colorScheme={user.role === 'mentor' ? 'blue' : 'green'}
                  size="sm"
                >
                  {user.role === 'mentor' ? '멘토' : '멘티'}
                </Badge>
              </Box>
            </HStack>
            
            {!isEditing ? (
              <Button
                leftIcon={<FaEdit />}
                onClick={startEditing}
                colorScheme="blue"
                variant="outline"
              >
                편집
              </Button>
            ) : (
              <HStack>
                <Button
                  leftIcon={<FaCheck />}
                  onClick={saveProfile}
                  colorScheme="blue"
                  isLoading={loading}
                  loadingText="저장 중..."
                >
                  저장
                </Button>
                <Button
                  leftIcon={<FaTimes />}
                  onClick={cancelEditing}
                  variant="outline"
                >
                  취소
                </Button>
              </HStack>
            )}
          </HStack>
        </CardHeader>

        <CardBody>
          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}

          <Stack gap={4}>
            {/* 매칭 상태 */}
            <Box>
              <Text fontWeight="bold" mb={2}>매칭 상태</Text>
              <Badge
                colorScheme={user.is_matched ? 'green' : 'gray'}
                size="lg"
                p={2}
              >
                {user.is_matched ? '매칭됨' : '매칭 대기중'}
              </Badge>
            </Box>

            <Divider />

            {/* 이름 */}
            <FormControl>
              <FormLabel>이름</FormLabel>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  
                />
              ) : (
                <Text>{user.name}</Text>
              )}
            </FormControl>

            {/* 자기소개 */}
            <FormControl>
              <FormLabel>자기소개</FormLabel>
              {isEditing ? (
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="자신을 소개해주세요"
                  
                  rows={4}
                />
              ) : (
                <Text whiteSpace="pre-wrap">{user.bio || '자기소개가 없습니다.'}</Text>
              )}
            </FormControl>

            {/* 스킬 */}
            <FormControl>
              <FormLabel>
                스킬 {user.role === 'mentor' ? '(제공 가능한 스킬)' : '(관심 있는 스킬)'}
              </FormLabel>
              
              {isEditing ? (
                <>
                  <HStack mb={2}>
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="스킬을 입력하세요"
                      
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <IconButton
                      aria-label="스킬 추가"
                      icon={<FaPlus />}
                      onClick={addSkill}
                      colorScheme="blue"
                      variant="outline"
                    />
                  </HStack>
                  {skills.length > 0 && (
                    <Wrap>
                      {skills.map((skill) => (
                        <WrapItem key={skill}>
                          <Tag size="md" variant="solid" colorScheme="blue">
                            <TagLabel>{skill}</TagLabel>
                            <TagCloseButton onClick={() => removeSkill(skill)} />
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  )}
                </>
              ) : (
                <Wrap>
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((skill) => (
                      <WrapItem key={skill}>
                        <Tag size="md" colorScheme="blue">
                          {skill}
                        </Tag>
                      </WrapItem>
                    ))
                  ) : (
                    <Text color="gray.500">등록된 스킬이 없습니다.</Text>
                  )}
                </Wrap>
              )}
            </FormControl>
          </Stack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default ProfilePage;
