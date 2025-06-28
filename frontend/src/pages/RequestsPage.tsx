import React, { useState, useEffect } from 'react';
import {
  VStack,
  Heading,
  Text,
  Badge,
  Button,
  HStack,
  Spinner,
  Center,
  Box,
  Stack,
  Flex,
} from '@chakra-ui/react';
import { FaCheck, FaTimes, FaTrash, FaUser } from 'react-icons/fa';
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

// Simple toast function for Chakra UI v3
const showToast = (title: string, description: string, status: 'success' | 'error') => {
  console.log(`[${status.toUpperCase()}] ${title}: ${description}`);
  alert(`${title}: ${description}`);
};

/**
 * Get status badge color scheme
 */
const getStatusColorScheme = (status: string) => {
  switch (status) {
    case 'pending':
      return 'yellow';
    case 'accepted':
      return 'green';
    case 'rejected':
      return 'red';
    case 'cancelled':
      return 'gray';
    default:
      return 'gray';
  }
};

/**
 * Get status text
 */
const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return '대기중';
    case 'accepted':
      return '수락됨';
    case 'rejected':
      return '거절됨';
    case 'cancelled':
      return '취소됨';
    default:
      return status;
  }
};

/**
 * Requests page component
 * @returns {JSX.Element} The requests page
 */
const RequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [receivedRequests, setReceivedRequests] = useState<MatchRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});

  /**
   * Load requests from API
   */
  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔍 RequestsPage - 사용자 정보:', user);
      console.log('🔍 RequestsPage - 사용자 역할:', user?.role);

      if (!user) {
        console.log('❌ 사용자 정보가 없어서 API 호출을 중단합니다.');
        return;
      }

      if (user.role === 'mentor') {
        // 멘토: 받은 요청만 조회
        console.log('📞 멘토로서 /match-requests/incoming 호출 중...');
        const receivedRes = await api.get('/match-requests/incoming');
        console.log('✅ 멘토 받은 요청 응답:', receivedRes);
        setReceivedRequests(Array.isArray(receivedRes) ? receivedRes : []);
        setSentRequests([]);
      } else if (user.role === 'mentee') {
        // 멘티: 보낸 요청만 조회
        console.log('📞 멘티로서 /match-requests/outgoing 호출 중...');
        const sentRes = await api.get('/match-requests/outgoing');
        console.log('✅ 멘티 보낸 요청 응답:', sentRes);
        console.log('✅ 응답 타입:', typeof sentRes, 'isArray:', Array.isArray(sentRes));
        setReceivedRequests([]);
        setSentRequests(Array.isArray(sentRes) ? sentRes : []);
      } else {
        console.log('❌ 알 수 없는 사용자 역할:', user.role);
      }
    } catch (error: any) {
      console.error('❌ API 호출 오류:', error);
      const errorMessage = error.message || '요청 목록을 불러오는데 실패했습니다.';
      setError(errorMessage);
      showToast('로딩 실패', errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle request action (accept/reject)
   */
  const handleRequestAction = async (requestId: number, action: 'accept' | 'reject') => {
    try {
      setActionLoading(prev => ({ ...prev, [requestId]: true }));

      await api.put(`/match-requests/${requestId}/${action}`);
      
      showToast(
        action === 'accept' ? '요청 수락' : '요청 거절',
        `매칭 요청이 ${action === 'accept' ? '수락' : '거절'}되었습니다.`,
        'success'
      );

      // Reload requests
      await loadRequests();
    } catch (error: any) {
      const errorMessage = error.message || `요청 ${action === 'accept' ? '수락' : '거절'}에 실패했습니다.`;
      showToast('오류', errorMessage, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  /**
   * Cancel sent request
   */
  const cancelRequest = async (requestId: number) => {
    try {
      setActionLoading(prev => ({ ...prev, [requestId]: true }));

      await api.delete(`/match-requests/${requestId}`);
      
      showToast('요청 취소', '매칭 요청이 취소되었습니다.', 'success');

      // Reload requests
      await loadRequests();
    } catch (error: any) {
      const errorMessage = error.message || '요청 취소에 실패했습니다.';
      showToast('오류', errorMessage, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect 트리거됨 - user:', user);
    if (user) {
      console.log('✅ 사용자 정보가 있음, loadRequests 호출');
      loadRequests();
    } else {
      console.log('❌ 사용자 정보가 없음, loadRequests 호출하지 않음');
    }
  }, [user]);

  if (loading) {
    return (
      <Center py={20}>
        <VStack gap={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>요청 목록을 불러오는 중...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      <Heading size="lg">매칭 요청</Heading>

      {error && (
        <Box bg="red.50" p={4} borderRadius="md" borderLeftWidth="4px" borderLeftColor="red.400">
          <Text color="red.700">{error}</Text>
        </Box>
      )}

      {/* Tab Navigation - 역할에 따라 다르게 표시 */}
      {user?.role === 'mentor' ? (
        <Box textAlign="center" bg="white" p={4} borderRadius="md" boxShadow="sm">
          <Text fontWeight="bold" color="blue.600">받은 요청 ({receivedRequests.length})</Text>
        </Box>
      ) : user?.role === 'mentee' ? (
        <Box textAlign="center" bg="white" p={4} borderRadius="md" boxShadow="sm">
          <Text fontWeight="bold" color="blue.600">보낸 요청 ({sentRequests.length})</Text>
        </Box>
      ) : (
        <HStack justify="center" bg="white" p={2} borderRadius="md" boxShadow="sm">
          <Button
            onClick={() => setActiveTab('received')}
            colorScheme={activeTab === 'received' ? 'blue' : 'gray'}
            variant={activeTab === 'received' ? 'solid' : 'ghost'}
          >
            받은 요청 ({receivedRequests.length})
          </Button>
          <Button
            onClick={() => setActiveTab('sent')}
            colorScheme={activeTab === 'sent' ? 'blue' : 'gray'}
            variant={activeTab === 'sent' ? 'solid' : 'ghost'}
          >
            보낸 요청 ({sentRequests.length})
          </Button>
        </HStack>
      )}

      {/* Requests Content - 역할에 따라 다르게 표시 */}
      {user?.role === 'mentor' && (
        <VStack gap={4} align="stretch">
          {receivedRequests.length === 0 ? (
            <Box textAlign="center" py={10} bg="white" borderRadius="md" boxShadow="sm">
              <Text color="gray.500">받은 매칭 요청이 없습니다.</Text>
            </Box>
          ) : (
            receivedRequests.map((request) => (
              <Box key={request.id} bg="white" p={6} borderRadius="md" boxShadow="sm" borderWidth="1px" borderColor="gray.200">
                <Stack gap={4}>
                  <HStack justify="space-between" align="start">
                    <HStack gap={4}>
                      <Box
                        width="48px"
                        height="48px"
                        borderRadius="full"
                        bg="blue.100"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <FaUser color="blue" />
                      </Box>
                      <Box>
                        <Text fontWeight="bold">{request.mentee?.name}</Text>
                        <Text color="gray.600" fontSize="sm">{request.mentee?.email}</Text>
                        <Badge colorScheme={getStatusColorScheme(request.status)}>
                          {getStatusText(request.status)}
                        </Badge>
                      </Box>
                    </HStack>

                    {request.status === 'pending' && (
                      <HStack>
                        <Button
                          onClick={() => handleRequestAction(request.id, 'accept')}
                          colorScheme="green"
                          size="sm"
                          loading={actionLoading[request.id]}
                          display="flex"
                          alignItems="center"
                          gap={2}
                        >
                          <FaCheck />
                          수락
                        </Button>
                        <Button
                          onClick={() => handleRequestAction(request.id, 'reject')}
                          colorScheme="red"
                          variant="outline"
                          size="sm"
                          loading={actionLoading[request.id]}
                          display="flex"
                          alignItems="center"
                          gap={2}
                        >
                          <FaTimes />
                          거절
                        </Button>
                      </HStack>
                    )}
                  </HStack>

                  {request.message && (
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={1}>메시지:</Text>
                      <Text fontSize="sm" bg="gray.50" p={3} borderRadius="md">
                        {request.message}
                      </Text>
                    </Box>
                  )}

                  <Text fontSize="xs" color="gray.500">
                    {new Date(request.created_at).toLocaleString('ko-KR')}
                  </Text>
                </Stack>
              </Box>
            ))
          )}
        </VStack>
      )}

      {user?.role === 'mentee' && (
        <VStack gap={4} align="stretch">
          {sentRequests.length === 0 ? (
            <Box textAlign="center" py={10} bg="white" borderRadius="md" boxShadow="sm">
              <Text color="gray.500">보낸 매칭 요청이 없습니다.</Text>
            </Box>
          ) : (
            sentRequests.map((request) => (
              <Box key={request.id} bg="white" p={6} borderRadius="md" boxShadow="sm" borderWidth="1px" borderColor="gray.200">
                <Stack gap={4}>
                  <HStack justify="space-between" align="start">
                    <HStack gap={4}>
                      <Box
                        width="48px"
                        height="48px"
                        borderRadius="full"
                        bg="blue.100"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <FaUser color="blue" />
                      </Box>
                      <Box>
                        <Text fontWeight="bold">{request.mentor?.name}</Text>
                        <Text color="gray.600" fontSize="sm">{request.mentor?.email}</Text>
                        <Badge colorScheme={getStatusColorScheme(request.status)}>
                          {getStatusText(request.status)}
                        </Badge>
                      </Box>
                    </HStack>

                    {request.status === 'pending' && (
                      <Button
                        onClick={() => cancelRequest(request.id)}
                        colorScheme="red"
                        variant="outline"
                        size="sm"
                        loading={actionLoading[request.id]}
                        display="flex"
                        alignItems="center"
                        gap={2}
                      >
                        <FaTrash />
                        취소
                      </Button>
                    )}
                  </HStack>

                  {request.message && (
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={1}>메시지:</Text>
                      <Text fontSize="sm" bg="gray.50" p={3} borderRadius="md">
                        {request.message}
                      </Text>
                    </Box>
                  )}

                  <Text fontSize="xs" color="gray.500">
                    {new Date(request.created_at).toLocaleString('ko-KR')}
                  </Text>
                </Stack>
              </Box>
            ))
          )}
        </VStack>
      )}
    </VStack>
  );
};

export default RequestsPage;
