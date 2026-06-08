#!/usr/bin/env python3
"""문서 링크 그래프 분석 및 index.md 링크 상태 섹션 자동 생성.

프로젝트 전체 .md 파일의 상호 참조를 분석하여,
docs/ 하위 각 index.md 하단에 백링크 상태 테이블을 삽입/갱신합니다.

사용법:
  python3 scripts/doc-links.py        # 모든 index.md 갱신
  python3 scripts/doc-links.py -n     # dry-run: 터미널에만 출력
"""

import os
import re
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

PROJECT_ROOT = Path(__file__).resolve().parent.parent

ARCHIVE_DIR = PROJECT_ROOT / "docs" / "archive"

MARKER_START = "<!-- LINK STATUS START -->"
MARKER_END = "<!-- LINK STATUS END -->"


SKIP_DIRS = {
    "node_modules", ".git", ".next", ".turbo", "dist", "build",
    "__pycache__", ".venv", "venv",
}


def _is_under_archive(path: Path) -> bool:
    """path가 docs/archive/ 아래인지 확인 (Python 3.9 호환)."""
    try:
        path.relative_to(ARCHIVE_DIR)
        return True
    except ValueError:
        return False


def collect_md_files() -> set:
    """프로젝트 전체 .md 파일 수집 (archive/ 등 제외)."""
    md_files: set = set()
    for root, dirs, files in os.walk(PROJECT_ROOT):
        root_path = Path(root)
        # archive/ 아래는 건너뛰기
        if _is_under_archive(root_path):
            dirs.clear()
            continue
        # 제외 디렉토리 필터
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".")]
        for f in files:
            if f.endswith(".md"):
                md_files.add((root_path / f).resolve())
    # .claude/rules/ 추가 (숨김 디렉토리지만 명시적 포함)
    rules_dir = PROJECT_ROOT / ".claude" / "rules"
    if rules_dir.exists():
        for f in rules_dir.glob("*.md"):
            md_files.add(f.resolve())
    return md_files


def find_target(link: str, src_file: Path, md_files: set) -> Optional[Path]:
    """링크 대상을 실제 파일 경로로 resolve. 실패 시 None."""
    # @docs/... 절대경로
    if link.startswith("docs/"):
        target = (PROJECT_ROOT / link).resolve()
        return target if target in md_files else None
    # 상대경로
    target = (src_file.parent / link).resolve()
    return target if target in md_files else None


def parse_references(md_files: set[Path]) -> dict[Path, set[Path]]:
    """파일 -> 피참조자 집합 (누가 이 파일을 참조하는지)."""
    refs_to: dict[Path, set[Path]] = defaultdict(set)

    # [text](path.md) 패턴
    md_link_re = re.compile(r"\[([^\]]*)\]\(([^)]+\.md)\)")
    # `@docs/path.md` 패턴 (백틱으로 감싸거나 인라인)
    atdocs_re = re.compile(r"@docs/([^\s`\)]+\.md)")

    for src_file in sorted(md_files):
        text = src_file.read_text()
        for m in md_link_re.finditer(text):
            target = find_target(m.group(2), src_file, md_files)
            if target and target != src_file:
                refs_to[target].add(src_file)
        for m in atdocs_re.finditer(text):
            target = find_target(f"docs/{m.group(1)}", src_file, md_files)
            if target and target != src_file:
                refs_to[target].add(src_file)

    return refs_to


def relative_display(target: Path, base_dir: Path) -> str:
    """base_dir 기준으로 표시용 상대경로.

    같은 디렉토리면 파일명만, 아니면 프로젝트 루트 기준 상대경로.
    """
    if target.parent == base_dir:
        return target.name
    return str(target.relative_to(PROJECT_ROOT))


def build_table_rows(
    dir_path: Path, md_files_in_dir: list[Path], refs_to: dict[Path, set[Path]]
) -> list[str]:
    """한 디렉토리 분량의 링크 상태 테이블 행 생성."""
    rows: list[str] = []
    for f in sorted(md_files_in_dir, key=lambda p: (p.name == "CLAUDE.md", p.name == "index.md", p.name)):
        name = f.name
        if name == "CLAUDE.md":
            rows.append(f"| `{name}` | 🟢 auto-loading |")
        else:
            backlinks = sorted(refs_to.get(f, set()))
            if backlinks:
                parts = [relative_display(bl, dir_path) for bl in backlinks]
                bl_str = ", ".join(parts)
                rows.append(f"| `{name}` | {bl_str} |")
            else:
                rows.append(f"| `{name}` | 🔴 없음 — orphan 확인 필요 |")
    return rows


def build_section(dir_path: Path, md_files_in_dir: list[Path], refs_to: dict[Path, set[Path]]) -> str:
    """링크 상태 섹션 전체 문자열 생성."""
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = [
        "",
        MARKER_START,
        "## 🔗 링크 상태",
        "",
        f"> ⚠️ `scripts/doc-links.py` 자동 생성 — 직접 수정 금지 · {now}",
        "",
        "| 파일 | 피참조 |",
        "|:-----|:-------|",
        *build_table_rows(dir_path, md_files_in_dir, refs_to),
        MARKER_END,
    ]
    return "\n".join(lines) + "\n"


def update_index_md(dir_path: Path, refs_to: dict, md_files: set, dry_run: bool) -> None:
    """하나의 index.md 파일을 갱신."""
    index_path = dir_path / "index.md"
    if not index_path.exists():
        return

    # 이 디렉토리 내 .md 파일들 (index.md, CLAUDE.md 포함)
    dir_files = sorted(
        [p for p in refs_to if p.parent == dir_path]
        + [p for p in md_files if p.parent == dir_path and p not in refs_to],
    )
    seen = set()
    dir_files = [p for p in dir_files if not (p in seen or seen.add(p))]

    if not dir_files:
        return

    section = build_section(dir_path, dir_files, refs_to)
    content = index_path.read_text()

    if MARKER_START in content and MARKER_END in content:
        new_content = re.sub(
            rf"{re.escape(MARKER_START)}.*?{re.escape(MARKER_END)}",
            section.rstrip(),
            content,
            flags=re.DOTALL,
        )
    else:
        new_content = content.rstrip("\n") + "\n" + section

    if dry_run:
        print(f"\n{'='*60}")
        print(f"DRY-RUN: {index_path.relative_to(PROJECT_ROOT)}")
        print(f"{'='*60}")
        # 변경된 부분만 출력
        added = new_content[len(content):]
        if added:
            print(added)
        else:
            old_section = re.search(
                rf"{re.escape(MARKER_START)}.*?{re.escape(MARKER_END)}",
                content,
                flags=re.DOTALL,
            )
            if old_section:
                print(f"  (갱신: {old_section.group()[:80]}...)")
            else:
                print("  (변경 없음)")
    else:
        index_path.write_text(new_content)
        print(f"  갱신: {index_path.relative_to(PROJECT_ROOT)}")


def collect_index_dirs() -> list:
    """docs/ 하위에서 index.md가 존재하는 모든 디렉토리 (archive/ 제외)."""
    dirs = []
    for root, subdirs, files in os.walk(PROJECT_ROOT / "docs"):
        root_path = Path(root)
        if _is_under_archive(root_path):
            subdirs.clear()
            continue
        if "index.md" in files:
            dirs.append(root_path)
    return sorted(dirs)


def main() -> None:
    dry_run = "-n" in sys.argv or "--dry-run" in sys.argv
    if dry_run:
        print("🔍 DRY-RUN 모드 — 파일을 실제로 수정하지 않습니다.\n")

    print("📁 .md 파일 수집 중...")
    md_files = collect_md_files()
    print(f"  {len(md_files)}개 파일 발견")

    print("🔗 참조 분석 중...")
    refs_to = parse_references(md_files)

    # 연결 수 통계
    total_links = sum(len(v) for v in refs_to.values())
    orphans = len([f for f in md_files if f not in refs_to])
    print(f"  {total_links}개 참조 연결, orphan {orphans}개")

    print("\n📝 index.md 갱신 중...")
    index_dirs = collect_index_dirs()
    for d in index_dirs:
        update_index_md(d, refs_to, md_files, dry_run)

    if dry_run:
        print("\n✅ DRY-RUN 완료 — 실제 적용하려면 -n 없이 실행하세요.")
    else:
        print("\n✅ 완료.")


if __name__ == "__main__":
    main()
