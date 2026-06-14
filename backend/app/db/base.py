from app.db.model_base import Base


# Import models so metadata is populated before create_all
from app.models.user import User  # noqa: F401
from app.models.analysis import Analysis  # noqa: F401
from app.models.keyword_list import KeywordList  # noqa: F401
from app.models.request_log import RequestLog  # noqa: F401
from app.models.activity import ActivityLog  # noqa: F401
from app.models.oauth_identity import OAuthIdentity  # noqa: F401
from app.models.device_push_token import DevicePushToken  # noqa: F401
from app.models.live_activity_start_token import LiveActivityStartToken  # noqa: F401
from app.models.live_activity_push_token import LiveActivityPushToken  # noqa: F401
from app.models.billing import AppStoreTransaction, UserBillingEntitlement  # noqa: F401
