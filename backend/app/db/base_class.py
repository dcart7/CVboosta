"""
Compatibility shim.

This project historically had two declarative bases (`model_base.Base` and
`base_class.Base`). Having two separate SQLAlchemy `MetaData` registries breaks
foreign keys and table creation (e.g. `activity_logs.user_id -> users.id`).

All models must share the same Base, so we re-export `model_base.Base` here.
"""

from app.db.model_base import Base
