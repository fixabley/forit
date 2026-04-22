#!/usr/bin/env python3
"""
Stop hook: Post session conversation history as a PR comment.
Reads the session JSONL transcript, filters to user/assistant text messages,
and posts a formatted Korean comment to the open PR for the current branch.
"""

import json
import sys
import os
import subprocess
from pathlib import Path


def extract_text(content):
    """Extract plain text from message content (string or list of blocks)."""
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict) and block.get('type') == 'text':
                text = block.get('text', '').strip()
                if text:
                    parts.append(text)
        return '\n\n'.join(parts)
    return ''


def get_transcript_path(hook_input):
    """Get transcript path from hook input or fall back to latest JSONL."""
    path = hook_input.get('transcript_path')
    if path and Path(path).exists():
        return path

    cwd = os.getcwd()
    encoded = cwd.lstrip('/').replace('/', '-')
    claude_dir = Path.home() / '.claude' / 'projects' / encoded
    if claude_dir.exists():
        jsonl_files = sorted(
            claude_dir.glob('*.jsonl'),
            key=lambda f: f.stat().st_mtime
        )
        if jsonl_files:
            return str(jsonl_files[-1])
    return None


def get_pr_number(branch):
    """Return the open PR number for the given branch, or None."""
    try:
        out = subprocess.check_output(
            ['gh', 'pr', 'list', '--head', branch,
             '--json', 'number', '--state', 'open'],
            text=True, stderr=subprocess.DEVNULL
        )
        prs = json.loads(out)
        return prs[0]['number'] if prs else None
    except Exception:
        return None


def parse_messages(transcript_path):
    """Parse transcript JSONL and return list of {role, text} dicts."""
    messages = []
    try:
        with open(transcript_path, encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                except Exception:
                    continue

                entry_type = entry.get('type')
                if entry_type not in ('user', 'assistant'):
                    continue

                msg = entry.get('message', {})
                role = msg.get('role', entry_type)
                text = extract_text(msg.get('content', ''))
                if text:
                    messages.append({'role': role, 'text': text})
    except Exception:
        pass
    return messages


def build_comment(branch, session_id, messages):
    """Build the formatted PR comment body."""
    lines = [
        '## 🤖 Claude Code 세션 대화 기록\n',
        f'> 브랜치: `{branch}` | 세션 ID: `{session_id}`\n',
        '---\n',
    ]
    for msg in messages:
        if msg['role'] == 'assistant':
            lines.append('### 🤖 Claude가 작성함\n')
        else:
            lines.append('### 👤 User\n')
        lines.append(msg['text'] + '\n')
        lines.append('---\n')

    comment = '\n'.join(lines)

    # GitHub PR comment limit: 65536 chars
    if len(comment) > 65000:
        comment = comment[:65000] + '\n\n> ⚠️ 대화 내용이 길어 일부 생략되었습니다.'
    return comment


def main():
    hook_input = {}
    try:
        raw = sys.stdin.read()
        if raw.strip():
            hook_input = json.loads(raw)
    except Exception:
        pass

    # Only run on Stop (not on error exits)
    stop_reason = hook_input.get('stop_reason', '')
    if stop_reason == 'error':
        sys.exit(0)

    transcript_path = get_transcript_path(hook_input)
    if not transcript_path:
        sys.exit(0)

    try:
        branch = subprocess.check_output(
            ['git', 'branch', '--show-current'],
            text=True, stderr=subprocess.DEVNULL
        ).strip()
    except Exception:
        sys.exit(0)

    if not branch or branch in ('main', 'dev'):
        sys.exit(0)

    pr_number = get_pr_number(branch)
    if not pr_number:
        sys.exit(0)

    messages = parse_messages(transcript_path)
    if not messages:
        sys.exit(0)

    session_id = hook_input.get('session_id', 'unknown')
    comment = build_comment(branch, session_id, messages)

    try:
        subprocess.run(
            ['gh', 'pr', 'comment', str(pr_number), '--body', comment],
            check=True, stderr=subprocess.DEVNULL
        )
        print(f"✅ 세션 대화 기록을 PR #{pr_number}에 게시했습니다.")
    except Exception as e:
        print(f"⚠️ PR 코멘트 게시 실패: {e}", file=sys.stderr)

    sys.exit(0)


if __name__ == '__main__':
    main()
