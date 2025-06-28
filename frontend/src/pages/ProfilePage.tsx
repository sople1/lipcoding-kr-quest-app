import React, { useState } from 'react';
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Text,
  HStack,
  Badge,
  Textarea,
  Stack,
  Flex,
} from '@chakra-ui/react';
import { FaEdit, FaPlus, FaCheck, FaTimes, FaUser } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

// Simple toast function for Chakra UI v3
const showToast = (title: string, description: string, status: 'success' | 'error') => {
  console.log(`[${status.toUpperCase()}] ${title}: ${description}`);
  alert(`${title}: ${description}`);
};

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

  /**
   * Handle input change
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Add a skill
   */
  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  /**
   * Remove a skill
   */
  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  /**
   * Save profile changes
   */
  const saveProfile = async () => {
    setLoading(true);
    setError('');

    try {
      await api.put('/api/user/profile', {
        name: formData.name,
        bio: formData.bio,
        skills
      });

      await refreshUser();
      setIsEditing(false);
      showToast('프로필 업데이트', '프로필이 성공적으로 업데이트되었습니다.', 'success');
    } catch (error: any) {
      const errorMessage = error.message || '프로필 업데이트에 실패했습니다.';
      setError(errorMessage);
      showToast('업데이트 실패', errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel editing
   */
  const cancelEditing = () => {
    setFormData({
      name: user?.name || '',
      bio: user?.bio || '',
    });
    setSkills(user?.skills || []);
    setIsEditing(false);
    setError('');
  };

  if (!user) {
    return (
      <Box textAlign="center" py={10}>
        <Text>사용자 정보를 불러올 수 없습니다.</Text>
      </Box>
    );
  }

  return (
    <VStack gap={6} maxW="2xl" mx="auto">
      <Box bg="white" p={8} borderRadius="lg" boxShadow="md" borderWidth="1px" borderColor="gray.200" w="100%">
        <VStack gap={6}>
          {/* Header */}
          <Flex justify="space-between" align="center" w="100%">
            <HStack gap={4}>
              <Box
                width="64px"
                height="64px"
                borderRadius="full"
                bg="blue.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FaUser size="24" color="blue" />
              </Box>
              <Box>
                <Heading size="md">{user.name}</Heading>
                <Text color="gray.600">{user.email}</Text>
                <Badge colorScheme={user.is_matched ? 'green' : 'gray'}>
                  {user.is_matched ? '매칭됨' : '매칭 대기중'}
                </Badge>
              </Box>
            </HStack>

            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                colorScheme="blue"
                variant="outline"
                display="flex"
                alignItems="center"
                gap={2}
              >
                <FaEdit />
                편집
              </Button>
            ) : (
              <HStack>
                <Button
                  onClick={saveProfile}
                  colorScheme="blue"
                  loading={loading}
                  loadingText="저장 중..."
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <FaCheck />
                  저장
                </Button>
                <Button
                  onClick={cancelEditing}
                  variant="outline"
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <FaTimes />
                  취소
                </Button>
              </HStack>
            )}
          </Flex>

          {error && (
            <Box bg="red.50" p={4} borderRadius="md" borderLeftWidth="4px" borderLeftColor="red.400" w="100%">
              <Text color="red.700">{error}</Text>
            </Box>
          )}

          <Box w="100%" borderTopWidth="1px" borderColor="gray.200" pt={6}>
            <Stack gap={4}>
              {/* 이름 */}
              <Box>
                <Text mb={2} fontWeight="medium">이름</Text>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="이름을 입력하세요"
                  />
                ) : (
                  <Text>{user.name}</Text>
                )}
              </Box>

              {/* 자기소개 */}
              <Box>
                <Text mb={2} fontWeight="medium">자기소개</Text>
                {isEditing ? (
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="자신을 소개해주세요"
                    rows={4}
                  />
                ) : (
                  <Text>{user.bio || '자기소개가 없습니다.'}</Text>
                )}
              </Box>

              {/* 스킬 (멘토인 경우만) */}
              {user.role === 'mentor' && (
                <Box>
                  <Text mb={2} fontWeight="medium">제공 가능한 스킬</Text>
                  {isEditing ? (
                    <VStack gap={2} align="start">
                      <HStack w="100%">
                        <Input
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          placeholder="스킬을 입력하세요"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        />
                        <Button
                          onClick={addSkill}
                          colorScheme="blue"
                          display="flex"
                          alignItems="center"
                          gap={2}
                        >
                          <FaPlus />
                        </Button>
                      </HStack>
                      
                      {skills.length > 0 && (
                        <Flex flexWrap="wrap" gap={2}>
                          {skills.map((skill) => (
                            <Badge
                              key={skill}
                              colorScheme="blue"
                              px={2}
                              py={1}
                              borderRadius="full"
                              cursor="pointer"
                              onClick={() => removeSkill(skill)}
                              display="flex"
                              alignItems="center"
                              gap={1}
                            >
                              {skill}
                              <FaTimes size="10" />
                            </Badge>
                          ))}
                        </Flex>
                      )}
                    </VStack>
                  ) : (
                    <Flex flexWrap="wrap" gap={2}>
                      {user.skills && user.skills.length > 0 ? (
                        user.skills.map((skill) => (
                          <Badge key={skill} colorScheme="blue">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <Text color="gray.500">스킬이 등록되지 않았습니다.</Text>
                      )}
                    </Flex>
                  )}
                </Box>
              )}
            </Stack>
          </Box>
        </VStack>
      </Box>
    </VStack>
  );
};

export default ProfilePage;
