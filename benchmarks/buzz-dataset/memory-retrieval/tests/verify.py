#!/usr/bin/env python3
"""Deterministic verifier for pre-seeded cold-memory retrieval."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

EXPECTED_COLUMN = "net_gpv_var_usd"
EXPECTED_COLUMN_MENTION = re.compile(rf"\b{EXPECTED_COLUMN}\b")
USE_EXPECTED_COLUMN = re.compile(rf"\buse\s+{EXPECTED_COLUMN}\b")
REJECT_EXPECTED_COLUMN = re.compile(
    rf"\b(?:do|should|must|would|could|can)(?:\s+\w+){{0,2}}\s+not\s+use\s+{EXPECTED_COLUMN}\b"
    rf"|\b(?:don't|shouldn't|mustn't|wouldn't|couldn't|can't|never|not)\s+use\s+{EXPECTED_COLUMN}\b"
    rf"|\buse\s+gross_gpv\b[^.!?\n]*(?:instead\s+of|rather\s+than)\s+{EXPECTED_COLUMN}\b"
    rf"|\b(?:gross_gpv\b[^.!?\n]*,?\s*)?not\s+{EXPECTED_COLUMN}\b"
    rf"|\b{EXPECTED_COLUMN}\b[^.!?\n]{{0,24}}\b(?:incorrect|wrong)\b"
)


def _zero() -> dict[str, float]:
    return {
        "reward": 0.0,
        "answer_correct": 0.0,
        "threaded_reply": 0.0,
        "evidence_complete": 0.0,
    }


def _normalize_answer(content: str) -> str:
    """Normalize harmless presentation differences without changing meaning."""
    normalized = content.strip().casefold().replace("`", "").replace("’", "'")
    normalized = re.sub(r"\s+", " ", normalized)
    return normalized.rstrip(".!?").rstrip()


def score_evidence(evidence: object) -> tuple[dict[str, float], dict[str, Any]]:
    if not isinstance(evidence, dict):
        return _zero(), {"error": "evidence root is not an object"}

    identities = evidence.get("identities", {})
    agents = (
        [
            row
            for row in identities.values()
            if isinstance(row, dict) and row.get("role") == "orchestrator"
        ]
        if isinstance(identities, dict)
        else []
    )
    agent_pubkey = agents[0].get("pubkey") if len(agents) == 1 else None
    question_id = evidence.get("task_event_id")
    trial = evidence.get("trial", {})
    question_channel = trial.get("channel_id") if isinstance(trial, dict) else None

    messages = [row for row in evidence.get("messages", []) if isinstance(row, dict)]
    replies = [
        row
        for row in messages
        if agent_pubkey
        and row.get("pubkey") == agent_pubkey
        and row.get("channel_id") == question_channel
        and row.get("reply_to_event_id") == question_id
    ]
    answer = replies[-1] if replies else None
    content = str(answer.get("content", "")) if answer else ""
    normalized_answer = _normalize_answer(content)
    rejects_expected_column = bool(REJECT_EXPECTED_COLUMN.search(normalized_answer))
    if rejects_expected_column:
        answer_correct = 0.0
    elif USE_EXPECTED_COLUMN.search(normalized_answer):
        answer_correct = 1.0
    elif EXPECTED_COLUMN_MENTION.search(normalized_answer):
        answer_correct = 0.5
    else:
        answer_correct = 0.0
    threaded_reply = float(answer is not None)
    evidence_complete = float(
        evidence.get("schema_version") == 1
        and evidence.get("task_name") == "memory-retrieval"
        and evidence.get("truncated") is False
        and len(agents) == 1
        and isinstance(question_id, str)
        and isinstance(question_channel, str)
    )

    structural_score = float(threaded_reply == 1.0 and evidence_complete == 1.0)
    metrics = {
        "reward": answer_correct * structural_score,
        "answer_correct": answer_correct,
        "threaded_reply": threaded_reply,
        "evidence_complete": evidence_complete,
    }
    return metrics, {
        "question_event_id": question_id,
        "question_channel_id": question_channel,
        "answer_message_id": answer.get("id") if answer else None,
        "answer_content": content,
        "normalized_answer": normalized_answer,
        "rejects_expected_column": rejects_expected_column,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--evidence", type=Path, required=True)
    parser.add_argument("--reward", type=Path, required=True)
    parser.add_argument("--details", type=Path, required=True)
    args = parser.parse_args()
    try:
        metrics, details = score_evidence(
            json.loads(args.evidence.read_text(encoding="utf-8"))
        )
    except (OSError, json.JSONDecodeError) as error:
        metrics, details = _zero(), {"error": str(error)}
    args.reward.write_text(json.dumps(metrics, sort_keys=True) + "\n", encoding="utf-8")
    args.details.write_text(
        json.dumps(details, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
