# 멘토-멘티 매칭 앱

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

멘토와 멘티를 1:1로 매칭해주는 웹 애플리케이션입니다. React + TypeScript 프론트엔드와 Node.js + SQLite 백엔드로 구성되어 있습니다.
이 프로젝트는 2025년 6월 28일에 실시된 천하제일 입코딩대회에서 Github Copilot, VS Code Speech, https://github.com/lipcoding-kr/lipcoding-competition.git 를 이용하여 생성하였습니다.

## 🌟 주요 기능

### 👥 사용자 관리
- **회원가입/로그인**: JWT 기반 인증 시스템
- **역할 기반 접근**: 멘토/멘티 역할에 따른 차별화된 기능
- **프로필 관리**: 이름, 자기소개, 프로필 이미지, 스킬 관리

### 🔍 멘토 검색 (멘티 전용)
- **멘토 목록 조회**: 매칭 가능한 멘토 리스트
- **검색 및 필터링**: 이름, 스킬, 소개글로 검색
- **매칭된 멘토 표시**: 옵션으로 매칭된 멘토도 확인 가능

### 🤝 매칭 시스템
- **1:1 매칭**: 한 멘토는 한 명의 멘티와만 매칭
- **매칭 요청**: 멘티가 멘토에게 메시지와 함께 요청
- **요청 관리**: 수락/거절/취소 기능
- **중복 요청 방지**: 대기중인 요청이 있으면 다른 요청 불가

### 📋 요청 관리
- **멘토**: 받은 요청 목록 및 수락/거절
- **멘티**: 보낸 요청 목록 및 취소

## 🛠 기술 스택

### Frontend
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Chakra UI v3** - 컴포넌트 라이브러리
- **Vite** - 빌드 도구
- **React Router** - 클라이언트 사이드 라우팅

### Backend
- **Node.js** - 런타임 환경
- **TypeScript** - 타입 안전성
- **Express.js** - 웹 프레임워크
- **SQLite** - 데이터베이스
- **JWT** - 인증 토큰
- **express-validator** - 입력 검증

### 개발 도구
- **pnpm** - 패키지 매니저
- **ESLint** - 코드 품질 검사
- **Prettier** - 코드 포맷팅

## 🚀 설치 및 실행

### 사전 요구사항
- Node.js 18+ 
- pnpm 8+

### 1. 저장소 클론
```bash
git clone https://github.com/sople1/lipcoding-kr-quest-app
cd lipcoding-kr-quest-app
```

### 2. 의존성 설치
```bash
pnpm install
```

### 3. 환경 변수 설정
```bash
# 루트 디렉토리에 .env 파일 생성
echo "NODE_ENV=development" > .env

# 백엔드 디렉토리에 .env 파일 생성
echo "NODE_ENV=development" > backend/.env
```

### 4. 개발 서버 실행

#### 백엔드 실행 (포트 8080)
```bash
cd backend
pnpm run dev
```

#### 프론트엔드 실행 (포트 3000)
```bash
cd frontend
pnpm run dev
```

### 5. 애플리케이션 접속
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/swagger-ui

## 📁 프로젝트 구조

```
root/
├── package.json              # 워크스페이스 루트 설정
├── pnpm-workspace.yaml       # pnpm 워크스페이스 설정
├── README.md
├── LICENSE.md
├── frontend/                 # React 프론트엔드
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── components/       # 재사용 컴포넌트
│   │   ├── pages/           # 페이지 컴포넌트
│   │   ├── hooks/           # 커스텀 훅
│   │   ├── utils/           # 유틸리티 함수
│   │   └── types/           # TypeScript 타입 정의
│   └── ...
└── backend/                  # Node.js 백엔드
    ├── package.json
    ├── src/
    │   ├── routes/          # API 라우트
    │   ├── models/          # 데이터 모델
    │   ├── middleware/      # 미들웨어
    │   ├── utils/           # 유틸리티 함수
    │   └── types/           # TypeScript 타입 정의
    └── ...
```

## 🔐 인증 시스템

### JWT 토큰 구조
```json
{
  "iss": "mentor-mentee-app",
  "sub": "사용자ID",
  "aud": "mentor-mentee-users",
  "exp": 1234567890,
  "nbf": 1234567890,
  "iat": 1234567890,
  "jti": "고유토큰ID",
  "name": "사용자이름",
  "email": "사용자이메일",
  "role": "mentor|mentee"
}
```

### 인증 헤더
```
Authorization: Bearer <JWT_TOKEN>
```

## 📊 데이터베이스 스키마

### users 테이블
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK(role IN ('mentor', 'mentee')) NOT NULL,
  bio TEXT,
  profile_image BLOB,
  skills TEXT, -- JSON array for mentors
  is_matched INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### match_requests 테이블
```sql
CREATE TABLE match_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mentor_id INTEGER NOT NULL,
  mentee_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  status TEXT CHECK(status IN ('pending', 'accepted', 'rejected', 'cancelled')) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mentor_id) REFERENCES users (id),
  FOREIGN KEY (mentee_id) REFERENCES users (id)
);
```

## 🔒 보안 기능

- **SQL 인젝션 방지**: Prepared Statement 사용
- **XSS 공격 방지**: 입력 데이터 검증 및 이스케이프
- **Rate Limiting**: API 요청 빈도 제한
- **입력 검증**: express-validator를 통한 철저한 검증
- **비밀번호 암호화**: bcrypt 해싱

## 📖 API 문서

### 주요 엔드포인트

#### 인증
- `POST /api/signup` - 회원가입
- `POST /api/login` - 로그인

#### 사용자
- `GET /api/profile` - 프로필 조회
- `PUT /api/profile` - 프로필 수정

#### 멘토 (멘티 전용)
- `GET /api/mentors` - 멘토 목록 조회
- `GET /api/mentors/:id` - 멘토 상세 정보

#### 매칭 요청
- `POST /api/match-requests` - 매칭 요청 생성 (멘티)
- `GET /api/match-requests/incoming` - 받은 요청 조회 (멘토)
- `GET /api/match-requests/outgoing` - 보낸 요청 조회 (멘티)
- `PUT /api/match-requests/:id/accept` - 요청 수락 (멘토)
- `PUT /api/match-requests/:id/reject` - 요청 거절 (멘토)
- `DELETE /api/match-requests/:id` - 요청 취소 (멘티)

### Swagger UI
자세한 API 문서는 서버 실행 후 http://localhost:8080/swagger-ui 에서 확인할 수 있습니다.

## 🧪 테스트

### 테스트 계정
개발 및 테스트를 위한 계정을 생성할 수 있습니다:

```bash
# 테스트 멘토 계정
curl -X POST http://localhost:8080/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mentor@test.com",
    "password": "password123",
    "name": "테스트 멘토",
    "role": "mentor",
    "bio": "프론트엔드 개발 멘토입니다."
  }'

# 테스트 멘티 계정
curl -X POST http://localhost:8080/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mentee@test.com", 
    "password": "password123",
    "name": "테스트 멘티",
    "role": "mentee",
    "bio": "개발을 배우고 싶은 멘티입니다."
  }'
```

## 🤝 기여 가이드

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feat/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'feat: Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feat/amazing-feature`)
5. Pull Request를 생성합니다

### 커밋 메시지 규칙
```
{행동 키워드}: {작업 내용}

예시:
feat: 사용자 로그인 기능 구현
fix: 프로필 이미지 업로드 오류 수정
docs: API 명세서 업데이트
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE.md](LICENSE.md) 파일을 참조하세요.

## 🔗 관련 링크

- **참조 저장소**: [lipcoding-kr/lipcoding-competition](https://github.com/lipcoding-kr/lipcoding-competition)
- **대회 사이트**: [lipcoding.kr](https://lipcoding.kr)

## 👨‍💻 개발툴

- **Backend**: Node.js + TypeScript + SQLite
- **Frontend**: React + TypeScript + Chakra UI
- **DevOps**: GitHub Actions + Docker

---

**Happy Coding! 🚀**
