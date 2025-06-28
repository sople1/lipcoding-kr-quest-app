import React, { useState, useEffect } from 'react';
import {
  VStack,
  Heading,
  SimpleGrid,
  Text,
  Badge,
  Button,
  HStack,
  Spinner,
  Center,
  Input,
  Box,
  Flex,
} from '@chakra-ui/react';
import { FaSearch, FaUser, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

interface Mentor {
  id: number;
  name: string;
  email: string;
  bio?: string;
  skills?: string[];
  is_matched?: boolean;
}

// Simple toast function for Chakra UI v3
const showToast = (title: string, description: string, status: 'success' | 'error') => {
  // For now, use console.log. In production, you'd implement proper toast system
  console.log(`[${status.toUpperCase()}] ${title}: ${description}`);
  alert(`${title}: ${description}`);
};

/**
 * Mentors page component (for mentees)
 * @returns {JSX.Element} The mentors page
 */
const MentorsPage: React.FC = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [requestingMentorId, setRequestingMentorId] = useState<number | null>(null);

  /**
   * Load mentors from API
   */
  const loadMentors = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/mentors');
      setMentors(response.mentors || []);
    } catch (error: any) {
      const errorMessage = error.message || '멘토 목록을 불러오는데 실패했습니다.';
      setError(errorMessage);
      showToast(
        '멘토 목록 로드 실패',
        errorMessage,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send match request to a mentor
   */
  const handleMatchRequest = async (mentorId: number) => {
    try {
      setRequestingMentorId(mentorId);
      
      await api.post('/match-requests', {
        mentorId: mentorId,
        message: '안녕하세요! 멘토링을 요청드리고 싶습니다.',
      });

      showToast(
        '매칭 요청 전송 완료',
        '멘토에게 매칭 요청을 보냈습니다.',
        'success'
      );

      // Reload mentors to reflect any changes
      await loadMentors();
    } catch (error: any) {
      const errorMessage = error.message || '매칭 요청 전송에 실패했습니다.';
      showToast(
        '매칭 요청 실패',
        errorMessage,
        'error'
      );
    } finally {
      setRequestingMentorId(null);
    }
  };

  /**
   * Filter mentors based on search term
   */
  const filteredMentors = mentors.filter(mentor => {
    const searchLower = searchTerm.toLowerCase();
    return (
      mentor.name.toLowerCase().includes(searchLower) ||
      mentor.bio?.toLowerCase().includes(searchLower) ||
      mentor.skills?.some(skill => skill.toLowerCase().includes(searchLower))
    );
  });

  useEffect(() => {
    loadMentors();
  }, []);

  // Check if user is mentee
  if (user?.role !== 'mentee') {
    return (
      <VStack gap={6} align="stretch">
        <Box bg="orange.50" p={4} borderRadius="md" borderLeft="4px" borderLeftColor="orange.400">
          <HStack>
            <FaExclamationTriangle color="orange" />
            <Text color="orange.700">멘토 목록은 멘티만 볼 수 있습니다.</Text>
          </HStack>
        </Box>
      </VStack>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">멘토 찾기</Heading>
        <Button onClick={loadMentors} loading={loading}>
          새로고침
        </Button>
      </HStack>

      {/* Search */}
      <Box position="relative">
        <Input
          placeholder="멘토 이름, 소개, 스킬로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          paddingLeft="40px"
        />
        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)">
          <FaSearch color="gray" />
        </Box>
      </Box>

      {error && (
        <Box bg="red.50" p={4} borderRadius="md" borderLeft="4px" borderLeftColor="red.400">
          <HStack>
            <FaExclamationTriangle color="red" />
            <Text color="red.700">{error}</Text>
          </HStack>
        </Box>
      )}

      {loading ? (
        <Center py={10}>
          <Spinner size="xl" color="blue.500" />
        </Center>
      ) : (
        <>
          {filteredMentors.length === 0 ? (
            <Center py={10}>
              <Text color="gray.500">
                {searchTerm ? '검색 결과가 없습니다.' : '등록된 멘토가 없습니다.'}
              </Text>
            </Center>
          ) : (
            <>
              <Text color="gray.600">
                총 {filteredMentors.length}명의 멘토가 있습니다
              </Text>
              
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                {filteredMentors.map((mentor) => (
                  <Box key={mentor.id} border="1px" borderColor="gray.200" borderRadius="md" p={6} bg="white" shadow="sm">
                    <VStack align="start" gap={4}>
                      <HStack>
                        <Box
                          width="40px"
                          height="40px"
                          borderRadius="full"
                          bg="blue.100"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <FaUser color="blue" />
                        </Box>
                        <Box>
                          <Text fontWeight="bold">{mentor.name}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {mentor.email}
                          </Text>
                        </Box>
                      </HStack>

                      {mentor.bio && (
                        <Text fontSize="sm" color="gray.700">
                          {mentor.bio.length > 100 ? `${mentor.bio.substring(0, 100)}...` : mentor.bio}
                        </Text>
                      )}

                      {mentor.skills && mentor.skills.length > 0 && (
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" mb={2}>
                            제공 가능한 스킬:
                          </Text>
                          <Flex flexWrap="wrap" gap={2}>
                            {mentor.skills.map((skill) => (
                              <Badge
                                key={skill}
                                colorPalette="blue"
                                size="sm"
                                borderRadius="full"
                                px={2}
                                py={1}
                              >
                                {skill}
                              </Badge>
                            ))}
                          </Flex>
                        </Box>
                      )}

                      <HStack w="100%" justify="space-between">
                        <Badge
                          colorPalette={mentor.is_matched ? 'red' : 'green'}
                          size="sm"
                        >
                          {mentor.is_matched ? '매칭됨' : '매칭 가능'}
                        </Badge>

                        <Button
                          size="sm"
                          colorPalette="blue"
                          onClick={() => handleMatchRequest(mentor.id)}
                          disabled={mentor.is_matched || user?.is_matched}
                          loading={requestingMentorId === mentor.id}
                        >
                          {mentor.is_matched 
                            ? '매칭됨' 
                            : user?.is_matched 
                              ? '이미 매칭됨'
                              : '매칭 요청'
                          }
                        </Button>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </SimpleGrid>
            </>
          )}
        </>
      )}
    </VStack>
  );
};

export default MentorsPage;
