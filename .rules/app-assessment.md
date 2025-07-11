# 멘토-멘티 매칭 앱 평가

앱 개발을 마친 참가자는 [GitHub 리포지토리](https://aka.ms/lipcoding)에 [이슈](../../issues)로 자신이 완성한 앱의 리포지토리를 등록합니다. 이후 GitHub Actions 워크플로우를 통해 이슈에 등록한 내용을 바탕으로 평가를 진행합니다.

> **NOTE**: 이 때 최종 제출 시각을 넘겨서 제출한 참가자는 자동으로 탈락합니다.

## API 테스트

- 참석자가 제공한 명령어로 백엔드 API 앱을 실행시킬 수 있어야 합니다. (명령어 예시: `npm start`, `fastapi run`, `./mvnw spring-boot:run`, `./gradlew bootRun`, `dotnet run` 등)
- 평가자의 테스트 도구를 활용해 테스트를 진행합니다.
- 테스트를 통과하면 UI 테스트 단계로 넘어갑니다.
- 테스트를 통과하지 못하면 테스트 실패 이유와 함께 이슈가 닫힙니다.
  - 그러면 참가자는 앱을 수정해서 이슈를 다시 등록해야 합니다.
  - 이 때 다시 이슈를 등록하는 시점이 최종 제출 시각을 넘길 경우 참가자는 자동으로 탈락합니다.

## UI 테스트

- 참석자가 제공한 명령어로 프론트엔드 앱과 백엔드 앱을 실행시킬 수 있어야 합니다. (명령어 예시: `npm start`, `fastapi run`, `./mvnw spring-boot:run`, `./gradlew bootRun`, `dotnet run` 등)
- 평가자의 테스트 도구를 활용해 테스트를 진행합니다.
- 테스트를 통과하면 결선에 진출합니다.
- 테스트를 통과하지 못하면 테스트 실패 이유와 함께 이슈가 닫힙니다.
  - 그러면 참가자는 앱을 수정해서 이슈를 다시 등록해야 합니다.
  - 이 때 다시 이슈를 등록하는 시점이 최종 제출 시각을 넘길 경우 참가자는 자동으로 탈락합니다.

## 최종 결선

- 최종 결선에 진출한 참가자를 대상으로 투표를 통해 경품을 지급합니다.