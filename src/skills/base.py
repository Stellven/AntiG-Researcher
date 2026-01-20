from abc import ABC, abstractmethod
from typing import Any, Dict

class BaseSkill(ABC):
    """
    Abstract base class for all agent skills.
    """
    name: str = "base_skill"
    description: str = "Base skill description"

    @abstractmethod
    def execute(self, query: str, **kwargs) -> Dict[str, Any]:
        """
        Executes the skill.
        
        Args:
            query: The main input for the skill (e.g., search query).
            **kwargs: Additional arguments.
            
        Returns:
            A dictionary containing the results. e.g. {"content": "...", "source": "..."}
        """
        pass
