# Адаптивная высота панели и аккуратные индикаторы приложений

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

Этот документ поддерживается в соответствии с `.agent/PLANS.md`. Все не-code артефакты в этом плане написаны по-русски, а имена файлов, функций, настроек и команд оставлены в оригинальном виде.

## Purpose / Big Picture

Пользователь должен получить расширение GNOME Shell, которое стабильно выглядит на разных экранах, включая монитор с fractional scaling и встроенный экран ноутбука. После изменения высота верхней панели и размер dash-кнопок должны восприниматься как логические размеры интерфейса, а не как величины, вручную умноженные на scale factor основного монитора. Состояние открытых, сфокусированных и требующих внимания приложений должно отображаться аккуратными, предсказуемыми индикаторами, которые не ломают раскладку и не превращаются в некрасивые капсулы при смене масштаба.

Визуально результат проверяется так: пользователь включает расширение, задает разумные `panel-height`, `icon-size` и `button-margin`, затем переключается между экраном ноутбука и внешним монитором с другим масштабом. Верхняя панель остается сопоставимой по высоте, иконки не распирают строку, running/focused/urgent состояния читаются, а кнопки не прыгают по размеру при hover или смене фокуса.

## Progress

- [x] (2026-07-27 00:00Z) Импортирован upstream-код `fthx/dash-in-panel` в текущий репозиторий.
- [x] (2026-07-27 00:00Z) Проведен первичный осмотр `extension.js`, `stylesheet.css`, `prefs.js` и `.agent/PLANS.md`.
- [x] (2026-07-27 00:00Z) Зафиксирован план подхода: fork + targeted rewrite вместо полного переписывания с нуля.
- [x] (2026-07-27 00:35Z) Получено одобрение пользователя на этот ExecPlan перед изменением кода.
- [x] (2026-07-27 00:35Z) Вынесено применение высоты панели в helper `_applyPanelGeometry()` в `extension.js`.
- [x] (2026-07-27 00:35Z) Убрано прямое умножение `panel-height` и `_dot` размеров на scale factor primary monitor.
- [x] (2026-07-27 00:35Z) Принято решение сохранить существующий restart на `monitors-changed`, потому что после удаления ручного scale factor пересоздание больше не переносит ошибочный размер между мониторами.
- [x] (2026-07-27 00:35Z) Переработаны CSS и классы состояния в `stylesheet.css` и `extension.js`, чтобы focused/urgent/running индикаторы не меняли размер кнопки.
- [x] (2026-07-27 00:35Z) Обновлен текст настроек в `prefs.js`, чтобы он больше не обещал ручное масштабирование через scale factor.
- [x] (2026-07-27 00:35Z) Проверен синтаксис `extension.js` и `prefs.js` через `node --input-type=module --check`.
- [x] (2026-07-27 00:35Z) Проверено, что `extension.js` и `prefs.js` больше не содержат `get_monitor_scale`, `get_primary_monitor` и старый subtitle `Visible ... scale factor`.
- [ ] Провести ручную GNOME Shell проверку, если среда доступна на машине пользователя.

## Surprises & Discoveries

- Observation: Текущий upstream напрямую использует scale factor основного монитора для размеров, которые должны вести себя как логические UI-размеры.
  Evidence: В `extension.js` есть `global.display.get_monitor_scale(global.display.get_primary_monitor())`, затем `Main.panel.height = this._settings.get_int('panel-height') * scaleFactor`, а также изменение `item.child._dot.width` и `item.child._dot.height`.

- Observation: Визуальные состояния приложений сейчас задаются через `box-shadow: 0 0 0 ...`, что фактически не рисует полезную форму с ненулевым размером и плохо подходит для стабильной capsule-подложки.
  Evidence: В `stylesheet.css` классы `.dash-in-panel-focused-app`, `.dash-in-panel-colored-focused-app`, `.dash-in-panel-demands-attention-app` используют `box-shadow: 0 0 0 ...`.

- Observation: Локальный репозиторий после merge содержит минимальный набор файлов расширения, без тестового harness и без package.json.
  Evidence: `rg --files` показывает `extension.js`, `prefs.js`, `stylesheet.css`, `metadata.json`, `schemas/org.gnome.shell.extensions.dash-in-panel.gschema.xml`, `schemas/gschemas.compiled`, `AGENTS.md`, `LICENSE`.

- Observation: На текущей машине недоступны GNOME-native CLI проверки.
  Evidence: `gjs --version` и `glib-compile-schemas --strict --dry-run schemas` завершаются с `command not found`.

## Decision Log

- Decision: Не переписывать расширение с нуля на первом этапе.
  Rationale: Upstream уже содержит работающий lifecycle GNOME Shell extension, интеграцию с `Main.panel`, `Dash.Dash`, настройками и click behavior. Проблемные зоны локализованы в расчете размеров и CSS-индикаторах, поэтому полный rewrite создал бы больше риска, чем пользы.
  Date/Author: 2026-07-27 / Codex

- Decision: Считать значения `panel-height`, `icon-size` и `button-margin` логическими пикселями GNOME Shell, а не физическими пикселями монитора.
  Rationale: GNOME Shell уже работает в координатной системе интерфейса. Ручное умножение на scale factor primary monitor делает внешний монитор и экран ноутбука несогласованными, особенно при fractional scaling и при смене primary monitor.
  Date/Author: 2026-07-27 / Codex

- Decision: Сначала сделать targeted rewrite геометрии и индикаторов, сохранив существующие GSettings keys.
  Rationale: Сохранение ключей настроек не ломает пользовательскую конфигурацию и не требует миграции schema. Изменится семантика subtitle в prefs, но не имена и типы настроек.
  Date/Author: 2026-07-27 / Codex

- Decision: Сохранить существующий обработчик `monitors-changed` через `_restart()` на этом этапе.
  Rationale: Код расширения создает `DashButton`, перемещает элементы панели и подключает несколько сигналов. Более тонкий пересчет без restart потребует дополнительной проверки lifecycle и может создать новые ошибки. После удаления ручного умножения на scale factor restart уже не воспроизводит исходную проблему с завышенной высотой.
  Date/Author: 2026-07-27 / Codex

## Outcomes & Retrospective

Реализация завершена на уровне исходного кода. Геометрия панели и running dot больше не зависит от primary monitor scale factor. CSS-состояния focused и urgent переведены с фиктивного `box-shadow: 0 0 0 ...` на фон и границу, которые не меняют размер кнопки. `extension.js` и `prefs.js` проходят синтаксическую проверку через Node. Runtime-проверка в GNOME Shell еще не выполнена, потому что в текущей среде нет `gjs`, `glib-compile-schemas` и подтвержденной GNOME Shell session.

## Context and Orientation

Репозиторий находится в `/home/syrenny/Desktop/clones/my-dash-in-panel`. Это GNOME Shell extension. В GNOME Shell extension файл `extension.js` экспортирует класс расширения с методами `enable()` и `disable()`. Метод `enable()` вызывается при включении расширения, а `disable()` должен вернуть измененные части shell в нормальное состояние.

Ключевые файлы:

- `extension.js` содержит основную runtime-логику. Класс `DashInPanelExtension` меняет `Main.panel.height`, перемещает date menu, скрывает overview dash и добавляет `DashButton` в панель. Класс `DashPanel` наследуется от `Dash.Dash` и настраивает app icons, running dots, focus state, urgent state и click behavior.
- `stylesheet.css` содержит классы для app buttons, show apps button, running dot, focused app, urgent app и separator.
- `prefs.js` строит окно настроек через `Adw.PreferencesPage`, `Adw.SwitchRow` и `Adw.SpinRow`.
- `schemas/org.gnome.shell.extensions.dash-in-panel.gschema.xml` объявляет GSettings keys, включая `panel-height`, `icon-size`, `button-margin`, `colored-dot`, `show-running` и другие.

Термин "логические пиксели" в этом плане означает единицы размера, которыми GNOME Shell раскладывает элементы интерфейса. Пользователь задает высоту панели как "32", и shell сам отображает ее с учетом экрана. Термин "scale factor" означает множитель масштаба монитора. В текущем коде расширение вручную умножает настройки на scale factor основного монитора, что и создает рассинхрон между разными экранами.

## Plan of Work

Первый этап меняет только геометрию. В `extension.js` нужно добавить helper-метод в `DashInPanelExtension`, например `_applyPanelGeometry()`, который выставляет `Main.panel.height` из `this._settings.get_int('panel-height')` без умножения на `global.display.get_monitor_scale(...)`. Если понадобится ограничение, оно должно быть простым и локальным: clamp в пределах существующих bounds schema, то есть 16-64. Этот метод вызывается из `enable()` и из обработчика `monitors-changed`.

В `DashPanel._setStyle(item)` нужно перестать масштабировать `_dot.width` и `_dot.height` через primary monitor. Размеры dot/indicator должны контролироваться CSS и логическим `iconSize`, без изменения высоты через `+= scaleFactor`. Если GNOME Shell native dot требует программного размера, он должен получать логический размер, например `this.iconSize`, без дополнительного множителя.

Второй этап меняет визуальную модель состояний. В `stylesheet.css` нужно заменить фиктивные `box-shadow: 0 0 0 ...` на стили, которые рисуют стабильный фон или outline без влияния на размер кнопки. Базовая кнопка `.dash-in-panel-icon` должна иметь постоянный padding, border и border-radius. Focused state должен выглядеть как аккуратная подложка или outline. Urgent state должен быть заметным, но не увеличивать элемент. Running dot должен оставаться отдельным индикатором и не конфликтовать с focused state.

В `extension.js` нужно убедиться, что классы focused/urgent корректно добавляются и снимаются. Сейчас `_onWindowDemandsAttention()` только добавляет `.dash-in-panel-demands-attention-app`; при изменении focus или исчезновении demands attention может понадобиться симметричное снятие класса для каждого item. Это нужно сделать без изменения click behavior.

Третий этап обновляет настройки. В `prefs.js` нужно изменить subtitle для `panel-height` и `icon-size`, убрав утверждение `Visible height will be changed according to the scale factor` и аналогичный текст для icon size. Имена keys в schema менять не нужно.

Четвертый этап проверяет результат. В репозитории нет автоматического тестового harness, поэтому обязательны статические проверки синтаксиса доступными средствами и ручная проверка в GNOME Shell. Если установлен `gjs`, нужно выполнить синтаксическую проверку или загрузку файлов настолько, насколько это возможно вне shell. Если доступна локальная GNOME Shell session, нужно установить расширение или обновить его в user extensions directory и проверить визуально.

## Concrete Steps

Работать из корня репозитория:

    cd /home/syrenny/Desktop/clones/my-dash-in-panel

Перед реализацией проверить состояние:

    git status --short
    rg -n "get_monitor_scale|get_primary_monitor|panel-height|_dot|focused-app|demands-attention" extension.js stylesheet.css prefs.js

После одобрения ExecPlan внести изменения в `extension.js`, `stylesheet.css` и `prefs.js`. Не менять `README`, потому что пользователь явно не просил писать README.

После изменений проверить diff:

    git diff -- extension.js stylesheet.css prefs.js

Проверить schema при необходимости:

    glib-compile-schemas schemas

Если `gjs` доступен, выполнить минимальную проверку версии и синтаксиса:

    gjs --version

Полная runtime-проверка GNOME Shell extension обычно требует запущенной GNOME Shell session. Для ручной проверки скопировать или symlink-нуть расширение в каталог пользователя только если это согласовано с пользователем, потому что это меняет локальную GNOME-среду. Без такой проверки финальный отчет должен явно сказать, что runtime-проверка в Shell не выполнена.

## Validation and Acceptance

Изменение считается принятым, если в коде больше нет ручного умножения `panel-height` и indicator dimensions на `global.display.get_monitor_scale(global.display.get_primary_monitor())`.

Проверка кода:

    rg -n "get_monitor_scale|get_primary_monitor" extension.js

Фактический результат: команда не находит строк.

Проверка настроек:

    rg -n "Visible .*scale factor|scale factor" prefs.js

Фактический результат: команда не находит строк.

Синтаксическая проверка:

    node --input-type=module --check < extension.js
    node --input-type=module --check < prefs.js

Фактический результат: обе команды завершаются с exit code 0 и без вывода.

Ручная acceptance-проверка:

1. Включить расширение в GNOME Shell.
2. Установить `Top panel height` в 32 и `Icon size` в 20.
3. Проверить внешний монитор с fractional scaling и экран ноутбука.
4. Наблюдать, что панель не становится чрезмерно высокой при переходе между экранами.
5. Открыть несколько приложений, переключить фокус, вызвать состояние urgent, если возможно.
6. Наблюдать, что focused/urgent/running состояния читаются, а кнопки не меняют размер и не выглядят как случайно растянутые капсулы.

## Idempotence and Recovery

Изменения должны быть локальными и повторяемыми. Если правки в CSS дадут плохой визуальный результат, можно откатить только `stylesheet.css` к предыдущему состоянию и оставить геометрию отдельно. Если изменения в `extension.js` ломают загрузку расширения, восстановить last known good state можно через `git diff`, затем откатить только сделанные в рамках этого плана hunks, не затрагивая пользовательские изменения.

Команда `glib-compile-schemas schemas` перезаписывает `schemas/gschemas.compiled`. Это ожидаемый generated artifact в GNOME extensions. Если schema не менялась, этот шаг можно пропустить, чтобы не создавать лишний diff.

## Artifacts and Notes

Первичный поиск показал такие проблемные места:

    extension.js:53: let scaleFactor = global.display.get_monitor_scale(global.display.get_primary_monitor());
    extension.js:54: item.child._dot.width = this.iconSize * scaleFactor;
    extension.js:55: item.child._dot.height += scaleFactor;
    extension.js:321: let scaleFactor = global.display.get_monitor_scale(global.display.get_primary_monitor());
    extension.js:322: Main.panel.height = this._settings.get_int('panel-height') * scaleFactor;

CSS-состояния сейчас не рисуют стабильную форму:

    .dash-in-panel-focused-app {
      box-shadow: 0 0 0 rgba(142, 142, 142, 0.5);
    }

## Interfaces and Dependencies

Новые внешние зависимости добавлять не нужно. Используются только существующие GNOME Shell modules:

- `gi://Clutter`
- `gi://GLib`
- `gi://GObject`
- `gi://Shell`
- `resource:///org/gnome/shell/ui/dash.js`
- `resource:///org/gnome/shell/ui/main.js`
- `resource:///org/gnome/shell/ui/panelMenu.js`
- `resource:///org/gnome/shell/extensions/extension.js`

В `extension.js` должен появиться или быть явно сформирован внутренний интерфейс для геометрии:

    _applyPanelGeometry()

Этот метод не является public API. Он должен читать `this._settings.get_int('panel-height')` и применять высоту к `Main.panel.height` в логических пикселях. Если понадобится helper для clamp, он должен быть приватным и простым, например:

    _getPanelHeight()

В `DashPanel` можно добавить приватный helper для styling, например `_syncAppButtonState(item)`, только если это реально уменьшит дублирование между focus и urgent handling. Если дублирование останется маленьким, лучше сохранить текущую структуру и не вводить лишнюю абстракцию.
