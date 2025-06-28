# Copilot Instructions

## 1. 프로젝트 명세

`.rules` 폴더 안에 있는 모든 파일들의 명세를 참조하여 코드를 생성하여야 합니다.

## 2. 프로젝트 구조

다음 폴더 구조를 준수합니다:

```
root/
├── package.json (워크스페이스 루트)
├── frontend/
│   ├── package.json
│   └── src/
│       └── (모든 프론트엔드 소스코드)
└── backend/
    ├── package.json
    └── src/
        └── (모든 백엔드 소스코드)
```

- 각 폴더별로 `package.json`을 구성
- 상단에서 두 `package.json`을 다룰 수 있는 루트 `package.json` 구성
- 모든 소스코드는 각 폴더의 `src` 폴더 하위에 위치

## 3. 기술 스택

### Frontend
- **언어**: TypeScript
- **프레임워크**: React
- **UI 라이브러리**: Chakra UI v3
- **빌드 도구**: Vite + Rollup
- **JavaScript 버전**: ES2025 이상

### Backend
- **언어**: TypeScript
- **런타임**: Node.js
- **데이터베이스**: SQLite
- **JavaScript 버전**: ES2025 이상

## 4. 패키지 관리

- **패키지 매니저**: pnpm (npm 대신 사용)
- 모든 의존성 설치 및 스크립트 실행은 pnpm 기준

## 5. 개발 규칙

### 문서화
- 소스코드 내 모든 함수는 상단에 **JSDoc 규격** 준수

### 코드 품질
- TypeScript strict 모드 사용
- ESLint, Prettier 적용
- 컴포넌트 및 함수 단위 테스트 작성

## 6. 실행 환경

### 포트 설정
- **프론트엔드**: `http://localhost:3000`
- **백엔드**: `http://localhost:8080`
- **API 엔드포인트**: `http://localhost:8080/api`

### 환경 변수
- `.env` 파일을 통한 환경 설정 관리
- 개발/프로덕션 환경 분리

## 7. 기능 요구사항

### 핵심 비즈니스 로직
- **멘토-멘티 매칭**: 1:1 매칭만 허용 (한 멘토는 동시에 한 명의 멘티와만 매칭)
- **역할 기반 기능**: 멘토/멘티 역할에 따른 차별화된 기능 제공
- **매칭 요청 제한**: 멘티는 대기중인 요청이 있을 때 다른 멘토에게 중복 요청 불가

### 인증 및 JWT
- **JWT 클레임**: RFC 7519 표준 클레임 (`iss`, `sub`, `aud`, `exp`, `nbf`, `iat`, `jti`) 모두 포함
- **커스텀 클레임**: `name`, `email`, `role` (mentor/mentee) 필수 포함
- **토큰 유효기간**: 발급 시점부터 1시간

### 프로필 이미지
- **허용 형식**: `.jpg`, `.png` 만 허용
- **크기 제한**: 정사각형, 최소 500x500px, 최대 1000x1000px
- **파일 크기**: 최대 1MB
- **기본 이미지**: 
  - 멘토: `https://placehold.co/500x500.jpg?text=MENTOR`
  - 멘티: `https://placehold.co/500x500.jpg?text=MENTEE`

## 8. API 요구사항

### OpenAPI 문서
- **자동 생성**: `http://localhost:8080/openapi.json` 엔드포인트 제공
- **Swagger UI**: `http://localhost:8080/swagger-ui` 페이지 제공
- **루트 리다이렉트**: `http://localhost:8080` → Swagger UI 자동 이동

### API 구조
- **기본 경로**: `/api` 하위에 모든 엔드포인트 구성
- **인증 헤더**: `Authorization: Bearer <token>` 형식
- **데이터 형식**: 모든 요청/응답은 JSON 형식

## 9. 데이터베이스 요구사항

### 초기화
- 앱 최초 실행 시 데이터베이스 및 테이블 자동 생성
- 멘토와 멘티는 동일한 사용자 테이블 사용 (role 컬럼으로 구분)
- 프로필 이미지는 데이터베이스에 저장

### 보안
- **SQL 인젝션 방지**: Prepared Statement 사용
- **XSS 공격 방지**: 입력 데이터 검증 및 이스케이프
- **OWASP TOP 10**: 주요 웹 보안 취약점 대응

## 10. 개발 및 테스트

### 제한사항
- **개발 시간**: 3시간 제한
- **로컬 환경**: HTTPS 인증서 사용 안함 (HTTP로 충분)
- **자동 테스트**: GitHub Actions를 통한 API/UI 테스트

### 평가 기준
- API 테스트 통과 후 UI 테스트 진행
- 테스트 실패 시 재제출 가능 (제한시간 내)

## 11. Git 커밋 규칙

커밋 메시지 형식: `{행동 키워드}: {작업 내용}`

### 행동 키워드 예시
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 스타일 변경
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드 설정, 패키지 매니저 설정 등

### 예시
```
feat: 사용자 로그인 기능 구현
fix: 프로필 이미지 업로드 오류 수정
docs: API 명세서 업데이트
```