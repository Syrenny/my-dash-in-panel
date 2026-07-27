# GitHub Release установка для личного fork

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

Этот документ поддерживается в соответствии с `.agent/PLANS.md`. Все не-code артефакты в этом плане написаны по-русски, а имена файлов, функций, настроек и команд оставлены в оригинальном виде.

## Purpose / Big Picture

Пользователь должен получить простой личный способ установки и обновления расширения без публикации на `extensions.gnome.org`. После изменения GitHub Release будет содержать zip GNOME Shell extension и `install.sh`. Пользователь сможет обновиться одной командой из latest release, например через `curl -fsSL .../install.sh | bash`, потому что пользоваться этим будет только владелец fork.

CalVer используется как упорядоченная числовая версия в `metadata.json`, чтобы каждый release имел возрастающий `version`, понятный GNOME Shell tooling. Git tag остается читаемым, например `v2026.07.27.1`, а workflow преобразует его в число `2026072701`.

## Progress

- [x] (2026-07-27 00:00Z) Обсуждено, что `curl ... | bash` приемлем для личного использования, но release asset лучше брать из GitHub Release, а не из `main`.
- [x] (2026-07-27 00:00Z) Проверено, что рабочий каталог чистый перед началом нового изменения.
- [x] (2026-07-27 00:00Z) Проверен текущий `metadata.json`: `uuid` равен `dash-in-panel@fthx`, `url` указывает на upstream, `version` равен `999`.
- [x] (2026-07-27 00:47Z) Получено одобрение пользователя на этот ExecPlan перед изменением файлов.
- [x] (2026-07-27 00:47Z) Переименован identity fork в `metadata.json`: новый `uuid`, `name`, `url`, `description`, числовой `version`.
- [x] (2026-07-27 00:47Z) Добавлен `scripts/install.sh`, который скачивает latest release zip и устанавливает его через `gnome-extensions install --force`.
- [x] (2026-07-27 00:47Z) Добавлен `.github/workflows/release.yml`, который на tag `vYYYY.MM.DD.N` патчит `metadata.json`, собирает zip и публикует release assets.
- [x] (2026-07-27 00:47Z) Проверен shell script через `bash -n`.
- [x] (2026-07-27 00:47Z) Проверена логика преобразования tag `v2026.07.27.1` в numeric version `2026072701`.
- [x] (2026-07-27 00:47Z) YAML-проверка доступными локальными средствами невозможна: PyYAML, Ruby и `actionlint` отсутствуют.
- [x] (2026-07-27 00:47Z) Обновить этот ExecPlan фактическими результатами и написать итог.

## Surprises & Discoveries

- Observation: В репозитории уже есть `schemas/gschemas.compiled`.
  Evidence: `rg --files` показывает `schemas/gschemas.compiled`. Для release zip, собираемого через `gnome-extensions pack`, этот файл не должен добавляться вручную. Если `gnome-extensions pack` сам решит включить или пересобрать schemas, workflow должен доверять GNOME tooling.

- Observation: Текущий `metadata.json` наследует upstream identity.
  Evidence: В файле указаны `"uuid": "dash-in-panel@fthx"` и `"url": "https://github.com/fthx/dash-in-panel"`.

- Observation: В текущей среде нет локального YAML parser или GitHub Actions linter.
  Evidence: `python3` не имеет module `yaml`, `ruby` отсутствует, `actionlint` отсутствует. Поэтому `.github/workflows/release.yml` проверен ручным просмотром и раздельной проверкой bash-логики, но не полноценным YAML parser.

## Decision Log

- Decision: Использовать новый `uuid` `dash-in-panel@syrenny`.
  Rationale: Личный fork не должен конфликтовать с upstream `dash-in-panel@fthx`. Новый `uuid` делает установку и обновления предсказуемыми.
  Date/Author: 2026-07-27 / Codex

- Decision: Оставить `settings-schema` как `org.gnome.shell.extensions.dash-in-panel` на этом шаге.
  Rationale: Пользователь планирует использовать только этот fork, а смена schema id потребовала бы переименования schema-файла, id внутри XML и проверки миграции настроек. Для личного release/update механизма это лишний риск. Если позже понадобится параллельная установка upstream и fork, schema id можно переименовать отдельным атомарным изменением.
  Date/Author: 2026-07-27 / Codex

- Decision: Публиковать `install.sh` как GitHub Release asset и скачивать zip из `releases/latest/download`.
  Rationale: Это привязывает установку к опубликованному release, а не к состоянию ветки `main`. Для личного использования допускается one-liner `curl ... | bash`, но скрипт должен оставаться коротким и проверяемым.
  Date/Author: 2026-07-27 / Codex

- Decision: Генерировать numeric `metadata.json.version` из tag `vYYYY.MM.DD.N`.
  Rationale: GNOME metadata требует числовой version. Формат `YYYYMMDDNN` монотонно растет при обычном CalVer и читается человеком.
  Date/Author: 2026-07-27 / Codex

## Outcomes & Retrospective

Реализация завершена на уровне исходных файлов. После push tag вида `v2026.07.27.1` GitHub Actions должен создать release с `dash-in-panel@syrenny.shell-extension.zip` и `install.sh`; пользователь сможет установить или обновить расширение из latest release. Локально подтверждены `bash -n scripts/install.sh`, валидность JSON в `metadata.json` и CalVer-преобразование `v2026.07.27.1` в `2026072701`. Полноценная YAML-валидация и GitHub Actions runtime-проверка должны пройти уже на GitHub runner.

## Context and Orientation

Репозиторий находится в `/home/syrenny/Desktop/clones/my-dash-in-panel`. Это GNOME Shell extension. Основной identity расширения хранится в `metadata.json`. Поле `uuid` определяет имя каталога установки в `~/.local/share/gnome-shell/extensions/` и идентификатор для команд `gnome-extensions enable`, `disable`, `info`.

GitHub Actions workflow должен лежать в `.github/workflows/release.yml`. Он будет запускаться только по tags, чтобы обычные push в `main` не публиковали релизы. Скрипт установки должен лежать в `scripts/install.sh`, но в release он будет загружаться как asset, чтобы можно было скачать его через `https://github.com/Syrenny/my-dash-in-panel/releases/latest/download/install.sh`.

Термин "CalVer" здесь означает календарное версионирование. Git tag будет выглядеть как `v2026.07.27.1`, где последняя часть является номером релиза за день. Для GNOME metadata этот tag преобразуется в число `2026072701`.

## Plan of Work

В `metadata.json` нужно поменять upstream identity на fork identity. Новый `uuid` должен быть `dash-in-panel@syrenny`, `url` должен указывать на `https://github.com/Syrenny/my-dash-in-panel`, а `description` должен явно говорить, что это personal fork `fthx/dash-in-panel`. Поле `version` можно поставить в стартовое значение `2026072701`, но release workflow все равно будет патчить его при сборке из tag.

Нужно добавить `scripts/install.sh`. Скрипт должен быть POSIX-friendly bash script с `set -euo pipefail`. Он должен проверить наличие `gnome-extensions`, создать временный каталог, скачать zip из latest release через `curl` или `wget`, установить zip командой `gnome-extensions install --force`, включить `dash-in-panel@syrenny`, затем вывести короткую подсказку про logout/login или restart GNOME Shell. Скрипт может попытаться отключить старый `dash-in-panel@fthx`, если он установлен и включен, но не должен удалять пользовательские файлы вручную.

Нужно добавить `.github/workflows/release.yml`. Workflow должен запускаться на tags `v*.*.*.*`. Он должен checkout repo, установить нужные GNOME packages через `apt`, вычислить `VERSION_NUMBER` из `GITHUB_REF_NAME`, пропатчить `metadata.json`, собрать zip через `gnome-extensions pack --force`, переименовать zip в `dash-in-panel@syrenny.shell-extension.zip` при необходимости, проверить что zip существует, и создать GitHub Release с zip и `scripts/install.sh` как assets.

## Concrete Steps

Работать из корня репозитория:

    cd /home/syrenny/Desktop/clones/my-dash-in-panel

Перед реализацией проверить:

    git status --short
    cat metadata.json

После одобрения ExecPlan внести изменения через `apply_patch`.

Проверить shell script:

    bash -n scripts/install.sh

Если локально доступен Python с PyYAML, проверить YAML:

    python -c "import yaml; yaml.safe_load(open('.github/workflows/release.yml'))"

Если PyYAML не доступен, ограничиться внимательным просмотром workflow и финальным `git diff`.

Фактический результат: PyYAML, Ruby и `actionlint` недоступны в текущей среде, поэтому локальная YAML-валидация не выполнена.

Для выпуска релиза после merge:

    git tag v2026.07.27.1
    git push origin v2026.07.27.1

Для установки или обновления после появления GitHub Release:

    curl -fsSL https://github.com/Syrenny/my-dash-in-panel/releases/latest/download/install.sh | bash

## Validation and Acceptance

Изменение считается принятым, если `metadata.json` содержит `dash-in-panel@syrenny` и GitHub URL fork, `scripts/install.sh` проходит `bash -n`, а workflow содержит шаги сборки zip и публикации assets.

Acceptance для release workflow проверяется после push tag: на GitHub Actions должен пройти workflow `Release`, а в GitHub Release должны появиться два assets:

- `dash-in-panel@syrenny.shell-extension.zip`
- `install.sh`

Acceptance для установки: после выполнения one-liner на машине с GNOME Shell команда `gnome-extensions info dash-in-panel@syrenny` должна показать установленное расширение, а `gnome-extensions enable dash-in-panel@syrenny` должен завершиться без ошибки. Если GNOME Shell работает на Wayland, для применения обновленного кода может потребоваться logout/login.

## Idempotence and Recovery

`scripts/install.sh` должен быть повторяемым: повторный запуск скачивает latest zip и ставит его поверх текущей версии через `gnome-extensions install --force`. Он не должен удалять каталог расширения вручную, чтобы не повредить GNOME Shell state.

Если release workflow упал до публикации release, можно исправить workflow и создать новый tag с увеличенным CalVer suffix, например `v2026.07.27.2`. Если release уже опубликован с неправильным asset, безопаснее создать новый release tag, чем переписывать опубликованный tag.

Если новый `uuid` означает, что старый `dash-in-panel@fthx` остается установленным, пользователь может вручную отключить его:

    gnome-extensions disable dash-in-panel@fthx

## Artifacts and Notes

Текущий `metadata.json` перед изменением:

    "url": "https://github.com/fthx/dash-in-panel",
    "uuid": "dash-in-panel@fthx",
    "version": 999

Целевой one-liner:

    curl -fsSL https://github.com/Syrenny/my-dash-in-panel/releases/latest/download/install.sh | bash

## Interfaces and Dependencies

Новые runtime-зависимости расширения не добавляются. Для release workflow нужны системные packages GitHub runner:

- `gnome-shell`, чтобы получить CLI `gnome-extensions`.
- `libglib2.0-bin`, чтобы GNOME tooling мог работать со schemas.
- `zip`, если понадобится fallback или проверка архива.

Для `scripts/install.sh` нужны:

- `bash`
- `gnome-extensions`
- один из `curl` или `wget`

Скрипт должен использовать константы:

    REPO="Syrenny/my-dash-in-panel"
    UUID="dash-in-panel@syrenny"
    ZIP_NAME="${UUID}.shell-extension.zip"

Workflow должен использовать `softprops/action-gh-release` или GitHub CLI `gh release create`. Предпочтительно использовать `softprops/action-gh-release`, потому что он проще для публикации assets из Actions и использует стандартный `GITHUB_TOKEN`.
