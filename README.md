# Tabsurd

Расширение Chrome: сохраняет окна и группы вкладок, восстанавливает пропавшие и освобождает память. На компьютере с Tidy Reel ещё учитывает просмотры видео и скачивает их.

- `docs/` — идея и общие решения (`specification.md`), план (`plan.md`), расширение (`extension/`), сервер синхронизации (`sync_server/`): требования (`specification.md`) и технологии (`technologies.md`).
- `extension/` — расширение: WXT, React, Feature-Sliced Design.

## Расширение

Нужен pnpm: `corepack enable pnpm` (один раз; corepack входит в Node.js).

```
cd extension
pnpm install
pnpm build
```

Затем `chrome://extensions` → «Режим разработчика» → «Загрузить распакованное» → `extension/.output/chrome-mv3`. ID расширения постоянный: `hekmbnbeockkioccaegkknfdaagnmeni`.

Проверки: `pnpm compile` (типы), `pnpm lint:fsd` (слои FSD), `pnpm test`, всё сразу — `pnpm check`. В WebStorm те же команды — в конфигурациях запуска (`.idea/runConfigurations`); `dev` открывает Chrome с расширением и постоянным профилем в `extension/.chrome-profile`.
