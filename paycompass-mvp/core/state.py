from typing import Annotated, TypedDict, List
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    # Historia rozmów agentów
    messages: Annotated[List, add_messages]
    # Flaga bezpieczeństwa
    is_sanitized: bool
    # Ścieżka do pliku
    current_file: str
    # Wyniki obliczeń TCE
    calculations: dict