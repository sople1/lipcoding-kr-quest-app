import React from 'react';

/**
 * Main App component - Simple test version
 * @returns {JSX.Element} The main application component
 */
function App(): JSX.Element {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      background: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        멘토링 매칭 앱 - 테스트 중
      </h1>
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>✅ React 렌더링 성공!</h2>
        <p>이 화면이 보인다면 기본적인 React 앱이 정상적으로 작동하고 있습니다.</p>
        <p>다음 단계: Chakra UI와 라우팅을 다시 활성화합니다.</p>
        
        <div style={{ marginTop: '20px' }}>
          <h3>프로젝트 정보:</h3>
          <ul>
            <li>프론트엔드: React + TypeScript + Vite</li>
            <li>백엔드: Node.js + Express + SQLite</li>
            <li>UI 라이브러리: Chakra UI v3</li>
            <li>포트: Frontend(3000), Backend(8080)</li>
          </ul>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <button 
            style={{
              background: '#007ACC',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => alert('버튼 클릭 테스트 성공!')}
          >
            테스트 버튼
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
