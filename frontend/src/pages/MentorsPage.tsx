import React, { useState, useEffect } from 'react';
import {
  VStack,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Avatar,
  Text,
  Badge,
  Button,
  HStack,
  Tag,
  Wrap,
  WrapItem,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Input,
  InputGroup,
  InputLeftElement,
  Box,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
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
  
  const toast = useToast();

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
      toast({
        title: '멘토 목록 로드 실패',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send match request to mentor
   */
  const sendMatchRequest = async (mentorId: number) => {
    try {
      setRequestingMentorId(mentorId);
      
      await api.post('/match-requests', {
        mentorId: mentorId,
        message: '안녕하세요! 멘토링을 요청드리고 싶습니다.',
      });

      toast({
        title: '매칭 요청 전송 완료',
        description: '멘토에게 매칭 요청을 보냈습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Reload mentors to reflect any changes
      await loadMentors();
    } catch (error: any) {
      const errorMessage = error.message || '매칭 요청 전송에 실패했습니다.';
      toast({
        title: '매칭 요청 실패',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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
      <VStack spacing={6} align="stretch">
        <Alert status="warning">
          <AlertIcon />
          멘토 목록은 멘티만 볼 수 있습니다.
        </Alert>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">멘토 찾기</Heading>
        <Button onClick={loadMentors} loading={loading}>
          새로고침
        </Button>
      </HStack>

      {/* Search */}
      <Box>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="멘토 이름, 소개, 스킬로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            focusBorderColor="blue.500"
          />
        </InputGroup>
      </Box>

      {error && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
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
              
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {filteredMentors.map((mentor) => (
                  <Card key={mentor.id} shadow="md">
                    <CardBody>
                      <VStack align="start" spacing={4}>
                        <HStack>
                          <Avatar name={mentor.name} />
                          <Box>
                            <Text fontWeight="bold">{mentor.name}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {mentor.email}
                            </Text>
                          </Box>
                        </HStack>

                        {mentor.bio && (
                          <Text fontSize="sm" noOfLines={3}>
                            {mentor.bio}
                          </Text>
                        )}

                        {mentor.skills && mentor.skills.length > 0 && (
                          <Box>
                            <Text fontSize="sm" fontWeight="bold" mb={2}>
                              제공 가능한 스킬:
                            </Text>
                            <Wrap>
                              {mentor.skills.map((skill) => (
                                <WrapItem key={skill}>
                                  <Tag size="sm" colorPalette="blue">
                                    {skill}
                                  </Tag>
                                </WrapItem>
                              ))}
                            </Wrap>
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
                            onClick={() => sendMatchRequest(mentor.id)}
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
                    </CardBody>
                  </Card>
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
