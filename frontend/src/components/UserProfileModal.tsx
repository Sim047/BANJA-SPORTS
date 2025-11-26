import React from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const PLACEHOLDER = "https://placehold.co/80x80?text=U";

export default function UserProfileModal({
  user,
  visible,
  onClose,
  token,
  onOpenConversation,
  currentUserId
}: any) {
  if (!visible || !user) return null;

  const [followState, setFollowState] = React.useState(user.isFollowed);
  const [details, setDetails] = React.useState<any>(null);

  React.useEffect(() => {
    if (!token || !user) return;

    axios
      .get(API + "/api/users/profile/" + user._id, {
        headers: { Authorization: "Bearer " + token }
      })
      .then((r) => setDetails(r.data))
      .catch(() => {});
  }, [user, token]);

  async function toggleFollow() {
    try {
      const action = followState ? "unfollow" : "follow";

      await axios.post(
        `${API}/api/users/${user._id}/${action}`,
        {},
        { headers: { Authorization: "Bearer " + token } }
      );

      setFollowState(!followState);
    } catch (err) {
      console.error("follow error:", err);
    }
  }

  function avatar() {
    if (!user?.avatar) return PLACEHOLDER;
    if (user.avatar.startsWith("http")) return user.avatar;
    if (user.avatar.startsWith("/")) return API + user.avatar;
    return API + "/uploads/" + user.avatar;
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 p-6 rounded-xl w-80 border border-slate-700">

        {/* Avatar */}
        <div className="flex flex-col items-center">
          <img
            src={avatar()}
            className="w-24 h-24 rounded-md object-cover mb-3"
          />
          <h2 className="text-lg font-semibold">{user.username}</h2>
          <p className="text-xs text-muted">{user.email}</p>
        </div>

        {/* Followers / Following */}
        {details && (
          <div className="flex justify-around mt-4 text-center">
            <div>
              <div className="text-xl font-bold">{details.followersCount}</div>
              <div className="text-xs text-muted">Followers</div>
            </div>

            <div>
              <div className="text-xl font-bold">{details.followingCount}</div>
              <div className="text-xs text-muted">Following</div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          {user._id !== currentUserId && (
            <button className="btn flex-1" onClick={toggleFollow}>
              {followState ? "Unfollow" : "Follow"}
            </button>
          )}

          <button
            className="btn flex-1"
            onClick={() => onOpenConversation(user)}
          >
            Message
          </button>
        </div>

        <button
          className="mt-4 w-full text-center text-xs opacity-70 hover:opacity-100"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
