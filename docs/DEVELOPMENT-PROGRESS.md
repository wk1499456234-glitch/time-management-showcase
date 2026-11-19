# Development notes / 開発の記録

This record shares product lessons, not private operational instructions. Verification dates describe the stated version only.

## 1. 想法与需求 / アイデアと要件
Time and Output belong together, while a recorded quantity is not proof of mastery. The public demo lets visitors try recording without an account or AI charges. Saved fictional examples explain analysis separately from visitor data.

## 2. 设计 / 設計
Four pages separate timer, records, review and settings. Mobile comparisons use weekly metric groups instead of squeezing a desktop table. Evidence and original AI text remain expandable. Typography, woven artwork and reduced-motion behavior are preserved.

## 3. 实现 / 実装
The browser edition stores original text, timestamps and pauses in a versioned local envelope. Same-origin Web Locks and baseline checks protect concurrent tabs. The fixed five-week fixture is read-only; its three real parses and Japanese review keep provenance distinct from background records.

## 4. 修改 / 修正
The current reliability revision distinguishes persisted success from memory-only operations and rejected actions. Failed saves retain input; retries persist the same pending branch rather than append another Output. Editing and JSON import use the same result contract. Tokyo day boundaries and Output times no longer depend on the device zone. Application and tests use the same hash router; the backup target is unique and focusable.

## 5. 环境操作与整备 / 環境の整備
Only reviewed static files and built assets are published. Unreferenced legacy components and obsolete screenshots have been removed. Screenshot suffixes match their real formats. Dependency patches stay in compatible release families. Release and rollback instructions are in [DEPLOYMENT.md](../DEPLOYMENT.md); no backend or private network configuration is part of this repository.

## 6. 代码质量保证 / 品質保証
Tests cover fault injection, retry deduplication, original text, cross-tab conflicts, date boundaries, unit grouping and routes. Publication checks compare the candidate Git file set with the allowlist, verify hashes, and scan all text including scripts and workflows. Rejection tests exercise extra files and prohibited content. These scans supplement review; they are not a universal secret detector.

Historical milestones: browser persistence and whitespace/IME protection preceded the four-page interface; mobile evidence and comparison improvements were accepted before this revision. They are historical evidence, not a claim that every earlier device test was repeated. See [current validation](VALIDATION.md).
