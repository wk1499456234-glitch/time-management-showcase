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
