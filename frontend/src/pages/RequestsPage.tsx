import React, { useState, useEffect } from 'react';
import {
  VStack,
  Heading,
  Card,
  CardBody,
  Avatar,
  Text,
  Badge,
  Button,
  HStack,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Box,
  Divider,
  Stack,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

interface MatchRequest {
  id: number;
  mentor_id: number;
  mentee_id: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  mentor?: {
    id: number;
    name: string;
    email: string;
    bio?: string;
  };
  mentee?: {
    id: number;
    name: string;
    email: string;
    bio?: string;
  };
}

/**
 * Requests page component
 * @returns {JSX.Element} The requests page
 */
const RequestsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState<MatchRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState('');
  
  const toast = useToast();

  /**
   * Load requests from API
   */
  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');

      if (user?.role === 'mentor') {
        // Load incoming requests for mentors
        const response = await api.get('/match-requests/incoming');
        setIncomingRequests(response || []);
      } else if (user?.role === 'mentee') {
        // Load outgoing requests for mentees
        const response = await api.get('/match-requests/outgoing');
        setOutgoingRequests(response || []);
      }
    } catch (error: any) {
      const errorMessage = error.message || '요청 목록을 불러오는데 실패했습니다.';
      setError(errorMessage);
      toast({
        title: '요청 목록 로드 실패',
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
   * Accept match request
   */
  const acceptRequest = async (requestId: number) => {
    try {
      setActionLoading(requestId);
      
      await api.put(`/match-requests/${requestId}/accept`);
      
      toast({
        title: '매칭 요청 수락',
        description: '매칭 요청을 수락했습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh data
      await Promise.all([loadRequests(), refreshUser()]);
    } catch (error: any) {
      const errorMessage = error.message || '요청 수락에 실패했습니다.';
      toast({
        title: '요청 수락 실패',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Reject match request
   */
  const rejectRequest = async (requestId: number) => {
    try {
      setActionLoading(requestId);
      
      await api.put(`/match-requests/${requestId}/reject`);
      
      toast({
        title: '매칭 요청 거절',
        description: '매칭 요청을 거절했습니다.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      // Refresh data
      await loadRequests();
    } catch (error: any) {
      const errorMessage = error.message || '요청 거절에 실패했습니다.';
      toast({
        title: '요청 거절 실패',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Cancel match request
   */
  const cancelRequest = async (requestId: number) => {
    try {
      setActionLoading(requestId);
      
      await api.delete(`/match-requests/${requestId}`);
      
      toast({
        title: '매칭 요청 취소',
        description: '매칭 요청을 취소했습니다.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      // Refresh data
      await loadRequests();
    } catch (error: any) {
      const errorMessage = error.message || '요청 취소에 실패했습니다.';
      toast({
        title: '요청 취소 실패',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Get status color for badge
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'accepted': return 'green';
      case 'rejected': return 'red';
      case 'cancelled': return 'gray';
      default: return 'gray';
    }
  };

  /**
   * Get status text in Korean
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '대기중';
      case 'accepted': return '수락됨';
      case 'rejected': return '거절됨';
      case 'cancelled': return '취소됨';
      default: return status;
    }
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    loadRequests();
  }, [user?.role]);

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">
          {user?.role === 'mentor' ? '받은 매칭 요청' : '보낸 매칭 요청'}
        </Heading>
        <Button onClick={loadRequests} loading={loading}>
          새로고침
        </Button>
      </HStack>

      {error && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {user?.role === 'mentor' ? (
        // Mentor view - incoming requests
        <Tabs variant="enclosed">
          <TabList>
            <Tab>대기중 ({incomingRequests.filter(r => r.status === 'pending').length})</Tab>
            <Tab>처리 완료 ({incomingRequests.filter(r => r.status !== 'pending').length})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              <VStack gap={4} align="stretch">
                {incomingRequests.filter(r => r.status === 'pending').length === 0 ? (
                  <Center py={10}>
                    <Text color="gray.500">대기중인 매칭 요청이 없습니다.</Text>
                  </Center>
                ) : (
                  incomingRequests
                    .filter(r => r.status === 'pending')
                    .map((request) => (
                      <Card key={request.id} shadow="md">
                        <CardBody>
                          <Stack gap={4}>
                            <HStack justify="space-between">
                              <HStack>
                                <Avatar name={request.mentee?.name} />
                                <Box>
                                  <Text fontWeight="bold">{request.mentee?.name}</Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {request.mentee?.email}
                                  </Text>
                                </Box>
                              </HStack>
                              <Badge colorPalette={getStatusColor(request.status)}>
                                {getStatusText(request.status)}
                              </Badge>
                            </HStack>

                            <Box>
                              <Text fontWeight="bold" fontSize="sm" mb={1}>
                                요청 메시지:
                              </Text>
                              <Text fontSize="sm">{request.message}</Text>
                            </Box>

                            {request.mentee?.bio && (
                              <Box>
                                <Text fontWeight="bold" fontSize="sm" mb={1}>
                                  멘티 소개:
                                </Text>
                                <Text fontSize="sm">{request.mentee.bio}</Text>
                              </Box>
                            )}

                            <Divider />

                            <Flex justify="space-between" align="center">
                              <Text fontSize="sm" color="gray.500">
                                {formatDate(request.created_at)}
                              </Text>

                              <HStack>
                                <Button
                                  size="sm"
                                  colorPalette="green"
                                  onClick={() => acceptRequest(request.id)}
                                  loading={actionLoading === request.id}
                                  disabled={user?.is_matched}
                                >
                                  <FaCheck />
                                  수락
                                </Button>
                                <Button
                                  size="sm"
                                  colorPalette="red"
                                  variant="outline"
                                  onClick={() => rejectRequest(request.id)}
                                  loading={actionLoading === request.id}
                                >
                                  <FaTimes />
                                  거절
                                </Button>
                              </HStack>
                            </Flex>
                          </Stack>
                        </CardBody>
                      </Card>
                    ))
                )}
              </VStack>
            </TabPanel>

            <TabPanel px={0}>
              <VStack gap={4} align="stretch">
                {incomingRequests.filter(r => r.status !== 'pending').length === 0 ? (
                  <Center py={10}>
                    <Text color="gray.500">처리된 요청이 없습니다.</Text>
                  </Center>
                ) : (
                  incomingRequests
                    .filter(r => r.status !== 'pending')
                    .map((request) => (
                      <Card key={request.id} shadow="sm">
                        <CardBody>
                          <Stack gap={4}>
                            <HStack justify="space-between">
                              <HStack>
                                <Avatar name={request.mentee?.name} />
                                <Box>
                                  <Text fontWeight="bold">{request.mentee?.name}</Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {request.mentee?.email}
                                  </Text>
                                </Box>
                              </HStack>
                              <Badge colorPalette={getStatusColor(request.status)}>
                                {getStatusText(request.status)}
                              </Badge>
                            </HStack>

                            <Text fontSize="sm" color="gray.500">
                              {formatDate(request.created_at)}
                            </Text>
                          </Stack>
                        </CardBody>
                      </Card>
                    ))
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      ) : (
        // Mentee view - outgoing requests
        <VStack gap={4} align="stretch">
          {outgoingRequests.length === 0 ? (
            <Center py={10}>
              <Text color="gray.500">보낸 매칭 요청이 없습니다.</Text>
            </Center>
          ) : (
            outgoingRequests.map((request) => (
              <Card key={request.id} shadow="md">
                <CardBody>
                  <Stack gap={4}>
                    <HStack justify="space-between">
                      <HStack>
                        <Avatar name={request.mentor?.name} />
                        <Box>
                          <Text fontWeight="bold">{request.mentor?.name}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {request.mentor?.email}
                          </Text>
                        </Box>
                      </HStack>
                      <Badge colorPalette={getStatusColor(request.status)}>
                        {getStatusText(request.status)}
                      </Badge>
                    </HStack>

                    <Box>
                      <Text fontWeight="bold" fontSize="sm" mb={1}>
                        보낸 메시지:
                      </Text>
                      <Text fontSize="sm">{request.message}</Text>
                    </Box>

                    <Divider />

                    <Flex justify="space-between" align="center">
                      <Text fontSize="sm" color="gray.500">
                        {formatDate(request.created_at)}
                      </Text>

                      {request.status === 'pending' && (
                        <Button
                          size="sm"
                          colorPalette="red"
                          variant="outline"
                          onClick={() => cancelRequest(request.id)}
                          loading={actionLoading === request.id}
                        >
                          <FaTrash />
                          취소
                        </Button>
                      )}
                    </Flex>
                  </Stack>
                </CardBody>
              </Card>
            ))
          )}
        </VStack>
      )}
    </VStack>
  );
};

export default RequestsPage;
