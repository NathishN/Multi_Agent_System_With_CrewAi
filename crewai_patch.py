"""Strip Anthropic cache_breakpoint so Groq/LiteLLM requests succeed."""
from typing import cast

from crewai import LLM
from crewai.llms.cache import CACHE_BREAKPOINT_KEY
from crewai.utilities.types import LLMMessage

_orig_format_messages = LLM._format_messages_for_provider


def _format_messages_without_cache_breakpoint(
    self, messages: list[LLMMessage]
) -> list[dict[str, str]]:
    cleaned = cast(
        list[LLMMessage],
        [
            {k: v for k, v in msg.items() if k != CACHE_BREAKPOINT_KEY}
            for msg in messages
        ],
    )
    return _orig_format_messages(self, cleaned)


LLM._format_messages_for_provider = _format_messages_without_cache_breakpoint
