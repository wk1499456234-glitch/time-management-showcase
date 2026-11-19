# Source provenance / 来源

This is a standalone extraction of the Time Management frontend, not a fork of the development platform repository.

- Source checkpoint: `95e2c8a47842ee52b129a7b5719436fc3014d850`.
- Source commit title: `Checkpoint: add time management local persistence V0`.
- Source commit date: 2026-09-12.
- Earlier frontend checkpoints: `e41dcbd` (initial frontend prototype), `5f5fb4a` (stable local HH:mm session times).
- Extraction scope: the 37 tracked files under `frontend/` were compared with the fixed desktop release; source contents matched after line-ending normalization. 36 were extracted. The internal operational handover document was excluded and replaced with this sanitized provenance.
- No parent Git history, internal specifications, production records, launchers, credentials, Backend, Console or Research code is included.
- The desktop launcher still pointed to the source checkpoint during inspection. Its local HTTP service was not responding; no claim of a live desktop runtime hash comparison is made, and it was not restarted.
- The main development checkout contained an older frontend prototype. Extraction used the fixed persistence checkpoint, not that older checkout and not unrelated uncommitted work.

Showcase changes: public static hosting configuration, Japanese-first UI, complete storage/error translations, responsive layout, exact Output text preservation, IME confirmation guard, standalone documentation and regression checks. Business timer/persistence algorithms otherwise retain the source design. This is an explicitly requested standalone browser-storage showcase, not an implementation of the original Backend-oriented full V1 architecture.

A new repository will start its own history after owner approval. Source commit identifiers document lineage; the private source repository is not linked. No open-source license has been selected on the owner's behalf; choose one before advertising third-party reuse rights.

## 2026-11-18 selective integration

The earlier section describes the initial extraction, not the current desktop runtime. This update reuses only the product navigation/layout style, icons and scroll reveal from product checkpoint `44ccef45975c61c810c065ceec44ac338356540c`. Existing showcase timer, browser persistence, raw whitespace protection, IME protection and transactional JSON merge remain in use. The public wrapper and read-only example pages are standalone.

`src/data/ai-demo.json` contains only synthetic learning records and a field-by-field reviewed export of saved model results. Twenty-seven background records were prepared without AI; three parse responses and one Japanese weekly review were obtained from the stated model. Human confirmation changes type labels, not quantities or original text. A technical time label in review prose was replaced with its Japanese user-facing name by the product presentation layer. No full API response or request identifiers are included.

The public repository contains no personal records, service credentials, account configuration, runtime database or private development platform. No license or third-party reuse rights are newly granted by this update.

## 2026-11-19 TimeWeave UI delivery

The accepted four-page product layout, typography, woven SVG and progressive disclosure are adapted to this independent static edition. The browser persistence engine and its storage key remain from this repository. No server authentication, Provider adapter, server configuration or database is included. Multi-line Output editing preserves line breaks.

`src/data/ai-demo.json` is unchanged from public commit `3aba747`: five fictional weeks, 27 prestructured background records, three saved real model parses with human type confirmation, and one saved Japanese model review. The public runtime does not create new AI results. Newly recorded visitor data remains separate.
