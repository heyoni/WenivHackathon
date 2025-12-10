import { useState, useEffect, useRef, useCallback } from 'react';

const WS_BASE_URL = 'ws://localhost:8000';

// 사용자별 고유 색상 생성
const userColors = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E',
  '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E'
];

const getUserColor = (userId) => {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return userColors[hash % userColors.length];
};

export function useDocumentSync(documentId, initialFormData = {}) {
  const [formData, setFormData] = useState(initialFormData);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({}); // { [userId]: { field, userName, color } }
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const cursorTimeouts = useRef({}); // 커서 자동 제거용 타이머

  const connect = useCallback(() => {
    if (!documentId) return;

    // 기존 연결이 있으면 먼저 닫기
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close(1000);
      wsRef.current = null;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setConnectionError('인증 토큰이 없습니다');
      return;
    }

    const wsUrl = `${WS_BASE_URL}/api/documents/ws/${documentId}?token=${token}`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket 연결됨');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'init':
              // 초기 접속자 목록
              setOnlineUsers(data.online_users || []);
              break;

            case 'update':
              // 다른 사용자의 변경사항 반영
              if (data.changes) {
                setFormData(prev => ({ ...prev, ...data.changes }));
              }
              break;

            case 'join':
              // 새 사용자 입장
              setOnlineUsers(data.online_users || []);
              break;

            case 'leave':
              // 사용자 퇴장
              setOnlineUsers(data.online_users || []);
              // 해당 사용자의 커서 제거
              if (data.user_id) {
                setRemoteCursors(prev => {
                  const newCursors = { ...prev };
                  delete newCursors[data.user_id];
                  return newCursors;
                });
              }
              break;

            case 'cursor':
              // 다른 사용자의 커서 위치 표시
              if (data.user_id && data.field) {
                const userId = data.user_id;

                // 기존 타이머 제거
                if (cursorTimeouts.current[userId]) {
                  clearTimeout(cursorTimeouts.current[userId]);
                }

                // 커서 정보 업데이트
                setRemoteCursors(prev => ({
                  ...prev,
                  [userId]: {
                    field: data.field,
                    userName: data.user_name,
                    color: getUserColor(userId)
                  }
                }));

                // 3초 후 커서 자동 제거
                cursorTimeouts.current[userId] = setTimeout(() => {
                  setRemoteCursors(prev => {
                    const newCursors = { ...prev };
                    delete newCursors[userId];
                    return newCursors;
                  });
                }, 3000);
              }
              break;

            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (e) {
          console.error('메시지 파싱 오류:', e);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket 연결 종료:', event.code);
        setIsConnected(false);
        wsRef.current = null;

        // 비정상 종료시 재연결 시도
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`${delay}ms 후 재연결 시도...`);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket 오류:', error);
        setConnectionError('연결 오류가 발생했습니다');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket 생성 오류:', error);
      setConnectionError('연결을 생성할 수 없습니다');
    }
  }, [documentId]);

  // 연결 관리
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000);
      }
    };
  }, [connect]);

  // 초기 데이터 설정
  useEffect(() => {
    if (initialFormData && Object.keys(initialFormData).length > 0) {
      setFormData(initialFormData);
    }
  }, [initialFormData]);

  // 필드 업데이트 함수
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // WebSocket으로 변경사항 전송
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'update',
        changes: { [field]: value }
      }));
    }
  }, []);

  // 여러 필드 한번에 업데이트
  const updateFields = useCallback((changes) => {
    setFormData(prev => ({ ...prev, ...changes }));

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'update',
        changes
      }));
    }
  }, []);

  // 커서 위치 전송 (선택사항)
  const sendCursorPosition = useCallback((field) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'cursor',
        field
      }));
    }
  }, []);

  // 특정 필드에 대한 원격 커서 정보 가져오기
  const getCursorForField = useCallback((field) => {
    return Object.entries(remoteCursors)
      .filter(([, cursor]) => cursor.field === field)
      .map(([userId, cursor]) => ({ userId, ...cursor }));
  }, [remoteCursors]);

  return {
    formData,
    setFormData,
    updateField,
    updateFields,
    onlineUsers,
    remoteCursors,
    getCursorForField,
    isConnected,
    connectionError,
    sendCursorPosition,
    getUserColor
  };
}

export { getUserColor };
export default useDocumentSync;
