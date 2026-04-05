from app.db.model_base import Base


# Import models so metadata is populated before create_all
from app.models.user import User  # noqa: F401
from app.models.analysis import Analysis  # noqa: F401
from app.models.keyword_list import KeywordList  # noqa: F401
