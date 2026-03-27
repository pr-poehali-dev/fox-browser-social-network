import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const AVATAR_ME = "https://cdn.poehali.dev/projects/7b751f83-bce2-4c5c-85bb-dd33146e6f01/files/59fa87ae-39f4-4603-a7ea-c17dd1f4386c.jpg";
const POST_IMG = "https://cdn.poehali.dev/projects/7b751f83-bce2-4c5c-85bb-dd33146e6f01/files/58f0c6ab-d7c3-40f7-a67a-29f806a25006.jpg";
const FOX_LOGO = "https://cdn.poehali.dev/projects/7b751f83-bce2-4c5c-85bb-dd33146e6f01/files/a5b04cb9-22a4-44c7-8460-debf5baebd29.jpg";

// ── Avatar builder options ──────────────────────────────────────────────────
const AVATAR_FACES = ["🦊", "🐺", "🐱", "🐸", "🦁", "🐨", "🐼", "🦝", "🐙", "🦋"];
const AVATAR_COLORS = [
  { label: "Закат", value: "linear-gradient(135deg,#FF6B1A,#8B2FFF)" },
  { label: "Океан", value: "linear-gradient(135deg,#0EA5E9,#6366F1)" },
  { label: "Лес", value: "linear-gradient(135deg,#22C55E,#0EA5E9)" },
  { label: "Огонь", value: "linear-gradient(135deg,#EF4444,#F97316)" },
  { label: "Ночь", value: "linear-gradient(135deg,#1E293B,#7C3AED)" },
  { label: "Розовый", value: "linear-gradient(135deg,#EC4899,#F43F5E)" },
];
const AVATAR_ACCESSORIES = ["", "🕶️", "🎩", "👑", "🎀", "⭐", "💎", "🌟"];

type AvatarConfig = { face: string; color: string; accessory: string };

const DEFAULT_AVATAR: AvatarConfig = { face: "🦊", color: AVATAR_COLORS[0].value, accessory: "" };

function AvatarPreview({ config, size = 48 }: { config: AvatarConfig; size?: number }) {
  return (
    <div
      style={{ width: size, height: size, background: config.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}
    >
      <span style={{ fontSize: size * 0.45, lineHeight: 1 }}>{config.face}</span>
      {config.accessory && (
        <span style={{ position: "absolute", top: -size * 0.1, right: -size * 0.05, fontSize: size * 0.3, lineHeight: 1 }}>{config.accessory}</span>
      )}
    </div>
  );
}

const USERS = [
  { id: 1, name: "Алиса Фокс", handle: "@alice_fox", avatar: AVATAR_ME, bio: "Дизайнер • Фотограф • Путешественница 🦊", followers: 4820, following: 312, posts: 89 },
  { id: 2, name: "Макс Вольф", handle: "@max_wolf", avatar: FOX_LOGO, bio: "Frontend dev & coffee lover", followers: 2100, following: 180, posts: 45 },
  { id: 3, name: "Соня Ривер", handle: "@sonya_r", avatar: POST_IMG, bio: "Художник | Иллюстратор", followers: 9300, following: 521, posts: 203 },
];

type Comment = { id: number; user: typeof USERS[0]; text: string; time: string };
type Post = {
  id: number;
  user: typeof USERS[0];
  text: string;
  image: string | null;
  likes: number;
  comments: number;
  reposts: number;
  liked: boolean;
  time: string;
  tags: string[];
  commentList: Comment[];
  repostOf?: { user: typeof USERS[0]; text: string; image: string | null };
};

const INITIAL_POSTS: Post[] = [
  {
    id: 1, user: USERS[0],
    text: "Сегодня закат был просто нереальный 🌅 Такие моменты заставляют замереть и просто дышать...",
    image: POST_IMG, likes: 342, comments: 2, reposts: 14, liked: false, time: "2 мин назад", tags: ["закат", "настроение"],
    commentList: [
      { id: 1, user: USERS[1], text: "Потрясающий кадр! 🔥", time: "1 мин" },
      { id: 2, user: USERS[2], text: "Такая красота, хочу туда!", time: "только что" },
    ],
  },
  {
    id: 2, user: USERS[1],
    text: "Запустил новый проект! Месяц работы и наконец-то live 🚀 Если вы разраб — вы знаете это чувство",
    image: null, likes: 187, comments: 1, reposts: 22, liked: false, time: "15 мин назад", tags: ["разработка", "релиз"],
    commentList: [
      { id: 1, user: USERS[2], text: "Поздравляю! Ждём ссылку 😄", time: "10 мин" },
    ],
  },
  {
    id: 3, user: USERS[2],
    text: "Новая иллюстрация для книги! Работала над ней три недели, и вот результат ✨",
    image: FOX_LOGO, likes: 1203, comments: 0, reposts: 67, liked: false, time: "1 ч назад", tags: ["арт", "иллюстрация"],
    commentList: [],
  },
  {
    id: 4, user: USERS[0],
    text: "Пробовали свежий рецепт матча-латте с кокосовым молоком и карамелью. 10/10 рекомендую ☕",
    image: null, likes: 89, comments: 0, reposts: 5, liked: false, time: "3 ч назад", tags: ["еда", "кофе"],
    commentList: [],
  },
];

const NOTIFICATIONS = [
  { id: 1, icon: "Heart", color: "text-pink-400", text: "Макс Вольф поставил лайк вашему посту", time: "2 мин", read: false },
  { id: 2, icon: "UserPlus", color: "text-violet-400", text: "Соня Ривер подписалась на вас", time: "10 мин", read: false },
  { id: 3, icon: "MessageCircle", color: "text-blue-400", text: "Новый комментарий: «Потрясающе!»", time: "1 ч", read: true },
  { id: 4, icon: "Repeat2", color: "text-green-400", text: "Ваш пост репостнули 3 раза", time: "2 ч", read: true },
  { id: 5, icon: "Star", color: "text-yellow-400", text: "Ваш пост попал в рекомендации", time: "5 ч", read: true },
];

const RECOMMENDED = [
  { id: 1, user: USERS[1], mutual: 12 },
  { id: 2, user: USERS[2], mutual: 8 },
  { id: 3, user: { id: 4, name: "Рита Звезда", handle: "@rita_star", avatar: POST_IMG, followers: 6500 }, mutual: 3 },
];

const MESSAGES = [
  { id: 1, user: USERS[1], text: "Привет! Видел твой новый пост — огонь 🔥", time: "10:23", unread: 2 },
  { id: 2, user: USERS[2], text: "Спасибо за фидбек по иллюстрации!", time: "Вчера", unread: 0 },
  { id: 3, user: USERS[0], text: "Когда встретимся?", time: "Пн", unread: 0 },
];

type Tab = "feed" | "profile" | "messages" | "notifications" | "search" | "recommendations";
type Modal = "none" | "comments" | "repost" | "share" | "avatar";

// ── PostCard ────────────────────────────────────────────────────────────────
function PostCard({
  post,
  myAvatar,
  onLike,
  onOpenComments,
  onOpenRepost,
  onOpenShare,
}: {
  post: Post;
  myAvatar: AvatarConfig;
  onLike: (id: number) => void;
  onOpenComments: (id: number) => void;
  onOpenRepost: (id: number) => void;
  onOpenShare: (id: number) => void;
}) {
  return (
    <div className="fox-card p-4 post-card">
      {post.repostOf && (
        <div className="mb-3 pl-3 border-l-2 border-[var(--fox-orange)]/40 opacity-70">
          <p className="text-xs text-white/40 mb-1">↩ Репост от {post.repostOf.user.name}</p>
          <p className="text-white/60 text-xs line-clamp-2">{post.repostOf.text}</p>
          {post.repostOf.image && (
            <img src={post.repostOf.image} className="mt-1 rounded-lg w-full h-20 object-cover" alt="" />
          )}
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="story-ring flex-shrink-0">
          <div className="bg-[var(--fox-bg)] p-[2px] rounded-full">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.user.avatar} />
              <AvatarFallback>{post.user.name[0]}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white text-sm">{post.user.name}</span>
            <span className="text-white/30 text-xs">{post.user.handle}</span>
            <span className="text-white/20 text-xs ml-auto">{post.time}</span>
          </div>
          <p className="text-white/80 text-sm mt-1.5 leading-relaxed">{post.text}</p>
          {post.tags.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {post.tags.map(tag => <span key={tag} className="tag-badge">#{tag}</span>)}
            </div>
          )}
        </div>
      </div>

      {post.image && (
        <div className="mt-3 rounded-xl overflow-hidden">
          <img src={post.image} alt="post" className="w-full h-64 object-cover hover:scale-[1.01] transition-transform duration-300" />
        </div>
      )}

      <div className="flex items-center gap-1 mt-4 pt-3 border-t border-white/5">
        <button
          className={`like-btn flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/5 ${post.liked ? "text-[var(--fox-pink)]" : "text-white/40"}`}
          onClick={() => onLike(post.id)}
        >
          <Icon name="Heart" size={18} className={post.liked ? "fill-[var(--fox-pink)] text-[var(--fox-pink)]" : ""} />
          <span className="text-xs font-medium">{post.likes}</span>
        </button>

        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-blue-400 transition-all"
          onClick={() => onOpenComments(post.id)}
        >
          <Icon name="MessageCircle" size={18} />
          <span className="text-xs font-medium">{post.comments}</span>
        </button>

        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-green-400 transition-all"
          onClick={() => onOpenRepost(post.id)}
        >
          <Icon name="Repeat2" size={18} />
          <span className="text-xs font-medium">{post.reposts}</span>
        </button>

        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-[var(--fox-orange)] transition-all ml-auto"
          onClick={() => onOpenShare(post.id)}
        >
          <Icon name="Share2" size={18} />
        </button>
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("feed");
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [newPostText, setNewPostText] = useState("");
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [following, setFollowing] = useState<number[]>([]);
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");

  // modals
  const [modal, setModal] = useState<Modal>("none");
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [repostText, setRepostText] = useState("");
  const [shareLink] = useState("https://foxnet.app/post/1");
  const [shareCopied, setShareCopied] = useState(false);

  // avatar builder
  const [myAvatar, setMyAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [draftAvatar, setDraftAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [useCustomAvatar, setUseCustomAvatar] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePost = posts.find(p => p.id === activePostId) ?? null;

  const openModal = (m: Modal, postId?: number) => {
    setActivePostId(postId ?? null);
    setModal(m);
    setCommentText("");
    setRepostText("");
  };
  const closeModal = () => { setModal("none"); setActivePostId(null); };

  const handleLike = (postId: number) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !activePostId) return;
    setPosts(prev => prev.map(p =>
      p.id === activePostId
        ? {
            ...p,
            comments: p.comments + 1,
            commentList: [...p.commentList, { id: Date.now(), user: USERS[0], text: commentText.trim(), time: "только что" }],
          }
        : p
    ));
    setCommentText("");
  };

  const handleRepost = () => {
    if (!activePost) return;
    const newPost: Post = {
      id: Date.now(),
      user: USERS[0],
      text: repostText.trim() || "",
      image: null,
      likes: 0, comments: 0, liked: false, time: "только что", tags: [],
      reposts: 0,
      commentList: [],
      repostOf: { user: activePost.user, text: activePost.text, image: activePost.image },
    };
    setPosts(prev => {
      const updated = prev.map(p => p.id === activePostId ? { ...p, reposts: p.reposts + 1 } : p);
      return [newPost, ...updated];
    });
    closeModal();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }).catch(() => setShareCopied(true));
  };

  const handlePost = () => {
    if (!newPostText.trim() && !newPostImage) return;
    const newPostItem: Post = {
      id: Date.now(), user: USERS[0], text: newPostText,
      image: newPostImage, likes: 0, comments: 0, reposts: 0,
      liked: false, time: "только что", tags: [], commentList: [],
    };
    setPosts(prev => [newPostItem, ...prev]);
    setNewPostText("");
    setNewPostImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setNewPostImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleFollow = (userId: number) => {
    setFollowing(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const saveAvatar = () => {
    setMyAvatar(draftAvatar);
    setUseCustomAvatar(true);
    closeModal();
  };

  const filteredPosts = posts.filter(p =>
    p.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const unreadNotifs = NOTIFICATIONS.filter(n => !n.read).length;

  const navItems: { id: Tab; icon: string; label: string; badge?: number }[] = [
    { id: "feed", icon: "Home", label: "Лента" },
    { id: "search", icon: "Search", label: "Поиск" },
    { id: "recommendations", icon: "Sparkles", label: "Рекомендации" },
    { id: "messages", icon: "MessageCircle", label: "Сообщения", badge: 2 },
    { id: "notifications", icon: "Bell", label: "Уведомления", badge: unreadNotifs },
    { id: "profile", icon: "User", label: "Профиль" },
  ];

  // My avatar display
  const MyAvatarEl = () => useCustomAvatar
    ? <AvatarPreview config={myAvatar} size={40} />
    : <Avatar className="w-10 h-10"><AvatarImage src={AVATAR_ME} /><AvatarFallback>АФ</AvatarFallback></Avatar>;

  const MySidebarAvatarEl = () => useCustomAvatar
    ? <AvatarPreview config={myAvatar} size={36} />
    : <Avatar className="w-9 h-9"><AvatarImage src={AVATAR_ME} /><AvatarFallback>АФ</AvatarFallback></Avatar>;

  return (
    <div className="min-h-screen mesh-bg flex font-golos">

      {/* ── Modals overlay ── */}
      {modal !== "none" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeModal}>
          <div className="w-full max-w-lg fox-card p-6 animate-fade-up" onClick={e => e.stopPropagation()}>

            {/* COMMENTS */}
            {modal === "comments" && activePost && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-lg">Комментарии</h3>
                  <button onClick={closeModal} className="text-white/40 hover:text-white transition-colors"><Icon name="X" size={20} /></button>
                </div>
                <div className="fox-glass rounded-xl p-3 mb-4">
                  <p className="text-white/70 text-sm line-clamp-2">{activePost.text}</p>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                  {activePost.commentList.length === 0 && (
                    <p className="text-white/30 text-sm text-center py-4">Будь первым 🦊</p>
                  )}
                  {activePost.commentList.map(c => (
                    <div key={c.id} className="flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={c.user.avatar} /><AvatarFallback>{c.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-white/5 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-white">{c.user.name}</span>
                          <span className="text-xs text-white/30">{c.time}</span>
                        </div>
                        <p className="text-sm text-white/80">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="flex-shrink-0"><MyAvatarEl /></div>
                  <Input
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Написать комментарий..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                    onKeyDown={e => e.key === "Enter" && handleAddComment()}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className="fox-gradient w-11 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:opacity-90 transition-all"
                  >
                    <Icon name="Send" size={16} className="text-white" />
                  </button>
                </div>
              </>
            )}

            {/* REPOST */}
            {modal === "repost" && activePost && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-lg">Репост</h3>
                  <button onClick={closeModal} className="text-white/40 hover:text-white transition-colors"><Icon name="X" size={20} /></button>
                </div>
                <Textarea
                  value={repostText}
                  onChange={e => setRepostText(e.target.value)}
                  placeholder="Добавь своё мнение... (необязательно)"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none rounded-xl min-h-[80px] mb-3"
                />
                <div className="fox-glass rounded-xl p-3 mb-4 border-l-2 border-[var(--fox-orange)]/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="w-6 h-6"><AvatarImage src={activePost.user.avatar} /><AvatarFallback>{activePost.user.name[0]}</AvatarFallback></Avatar>
                    <span className="text-xs font-medium text-white">{activePost.user.name}</span>
                  </div>
                  <p className="text-white/60 text-sm line-clamp-3">{activePost.text}</p>
                  {activePost.image && <img src={activePost.image} className="mt-2 rounded-lg h-24 w-full object-cover" alt="" />}
                </div>
                <div className="flex gap-2">
                  <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl text-sm text-white/50 bg-white/5 hover:bg-white/10 transition-all">Отмена</button>
                  <button onClick={handleRepost} className="flex-1 py-2.5 rounded-xl text-sm font-semibold fox-gradient text-white hover:opacity-90 transition-all fox-glow-orange">
                    Репостнуть
                  </button>
                </div>
              </>
            )}

            {/* SHARE */}
            {modal === "share" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-lg">Поделиться</h3>
                  <button onClick={closeModal} className="text-white/40 hover:text-white transition-colors"><Icon name="X" size={20} /></button>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[
                    { icon: "MessageCircle", label: "Telegram", color: "bg-blue-500/20 text-blue-400" },
                    { icon: "Twitter", label: "Twitter", color: "bg-sky-500/20 text-sky-400" },
                    { icon: "Mail", label: "Email", color: "bg-orange-500/20 text-orange-400" },
                    { icon: "QrCode", label: "QR-код", color: "bg-violet-500/20 text-violet-400" },
                  ].map(({ icon, label, color }) => (
                    <button key={icon} className={`flex flex-col items-center gap-2 p-3 rounded-xl ${color} hover:opacity-80 transition-all`}>
                      <Icon name={icon} size={22} />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/50 truncate">{shareLink}</div>
                  <button
                    onClick={handleShare}
                    className={`px-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                      shareCopied ? "bg-green-500/20 text-green-400" : "fox-gradient text-white hover:opacity-90"
                    }`}
                  >
                    <Icon name={shareCopied ? "Check" : "Copy"} size={16} />
                    {shareCopied ? "Скопировано!" : "Копировать"}
                  </button>
                </div>
              </>
            )}

            {/* AVATAR BUILDER */}
            {modal === "avatar" && (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-white text-lg">Конструктор аватара</h3>
                  <button onClick={closeModal} className="text-white/40 hover:text-white transition-colors"><Icon name="X" size={20} /></button>
                </div>

                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <AvatarPreview config={draftAvatar} size={96} />
                    <div className="absolute -bottom-1 -right-1 bg-[var(--fox-surface)] rounded-full p-1 border border-white/10">
                      <Icon name="Sparkles" size={14} className="text-[var(--fox-orange)]" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-2">Персонаж</p>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_FACES.map(face => (
                        <button
                          key={face}
                          onClick={() => setDraftAvatar(d => ({ ...d, face }))}
                          className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                            draftAvatar.face === face ? "bg-[rgba(255,107,26,0.25)] ring-2 ring-[var(--fox-orange)]" : "bg-white/5 hover:bg-white/10"
                          }`}
                        >
                          {face}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-2">Фон</p>
                    <div className="flex gap-2 flex-wrap">
                      {AVATAR_COLORS.map(c => (
                        <button
                          key={c.value}
                          title={c.label}
                          onClick={() => setDraftAvatar(d => ({ ...d, color: c.value }))}
                          className={`w-8 h-8 rounded-full transition-all ${
                            draftAvatar.color === c.value ? "ring-2 ring-white scale-110" : "hover:scale-105"
                          }`}
                          style={{ background: c.value }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-2">Аксессуар</p>
                    <div className="flex gap-2 flex-wrap">
                      {AVATAR_ACCESSORIES.map((acc, i) => (
                        <button
                          key={i}
                          onClick={() => setDraftAvatar(d => ({ ...d, accessory: acc }))}
                          className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                            draftAvatar.accessory === acc ? "bg-[rgba(255,107,26,0.25)] ring-2 ring-[var(--fox-orange)]" : "bg-white/5 hover:bg-white/10"
                          }`}
                        >
                          {acc === "" ? <span className="text-white/30 text-xs">нет</span> : acc}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-5">
                  <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl text-sm text-white/50 bg-white/5 hover:bg-white/10 transition-all">Отмена</button>
                  <button onClick={saveAvatar} className="flex-1 py-2.5 rounded-xl text-sm font-semibold fox-gradient text-white hover:opacity-90 fox-glow-orange transition-all">
                    Сохранить аватар
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className="w-64 h-screen sticky top-0 flex flex-col px-4 py-6 border-r border-white/5">
        <div className="flex items-center gap-3 px-4 mb-8">
          <div className="w-10 h-10 rounded-xl fox-gradient flex items-center justify-center text-xl font-black text-white">🦊</div>
          <span className="text-2xl font-black fox-gradient-text tracking-tight">FoxNet</span>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item text-left w-full relative ${activeTab === item.id ? "active" : ""}`}
            >
              <Icon name={item.icon} size={20} />
              <span className="font-medium text-sm">{item.label}</span>
              {item.badge ? (
                <span className="ml-auto bg-[var(--fox-orange)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{item.badge}</span>
              ) : null}
            </button>
          ))}
        </nav>
        <button
          onClick={() => setActiveTab("profile")}
          className="fox-glass rounded-xl p-3 flex items-center gap-3 hover:border-white/15 transition-all"
        >
          <div className="story-ring">
            <MySidebarAvatarEl />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold text-white truncate">Алиса Фокс</p>
            <p className="text-xs text-white/40 truncate">@alice_fox</p>
          </div>
          <Icon name="MoreHorizontal" size={16} className="text-white/30" />
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 max-w-2xl mx-auto px-4 py-6">

        {/* FEED */}
        {activeTab === "feed" && (
          <div className="space-y-4 animate-fade-up">
            {/* Stories */}
            <div className="fox-card p-4">
              <div className="flex gap-4 overflow-x-auto pb-1">
                {[USERS[0], USERS[1], USERS[2]].map((u, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group">
                    <div className={`story-ring ${i === 0 ? "opacity-50" : ""}`}>
                      <div className="bg-[var(--fox-bg)] p-[2px] rounded-full">
                        <Avatar className="w-12 h-12"><AvatarImage src={u.avatar} /><AvatarFallback>{u.name[0]}</AvatarFallback></Avatar>
                      </div>
                    </div>
                    <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors truncate max-w-[56px]">
                      {i === 0 ? "Вы" : u.name.split(" ")[0]}
                    </span>
                  </div>
                ))}
                <div className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center group-hover:border-[var(--fox-orange)] transition-colors">
                    <Icon name="Plus" size={20} className="text-white/30 group-hover:text-[var(--fox-orange)]" />
                  </div>
                  <span className="text-xs text-white/50">Добавить</span>
                </div>
              </div>
            </div>

            {/* Composer */}
            <div className="fox-card p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0"><MyAvatarEl /></div>
                <div className="flex-1">
                  <Textarea
                    value={newPostText}
                    onChange={e => setNewPostText(e.target.value)}
                    placeholder="Что у тебя нового, Фокс? 🦊"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none text-sm rounded-xl min-h-[70px]"
                  />
                  {newPostImage && (
                    <div className="relative mt-2 rounded-xl overflow-hidden">
                      <img src={newPostImage} className="w-full h-40 object-cover" alt="preview" />
                      <button
                        onClick={() => setNewPostImage(null)}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-black/80 transition-all"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-lg hover:bg-white/8 text-white/40 hover:text-[var(--fox-orange)] transition-all"
                      >
                        <Icon name="Image" size={18} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-white/8 text-white/40 hover:text-[var(--fox-orange)] transition-all">
                        <Icon name="Smile" size={18} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-white/8 text-white/40 hover:text-[var(--fox-orange)] transition-all">
                        <Icon name="MapPin" size={18} />
                      </button>
                    </div>
                    <button
                      onClick={handlePost}
                      disabled={!newPostText.trim() && !newPostImage}
                      className="fox-gradient text-white px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-all fox-glow-orange"
                    >
                      Опубликовать
                    </button>
                  </div>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            {/* Posts */}
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                myAvatar={myAvatar}
                onLike={handleLike}
                onOpenComments={id => openModal("comments", id)}
                onOpenRepost={id => openModal("repost", id)}
                onOpenShare={id => openModal("share", id)}
              />
            ))}
          </div>
        )}

        {/* SEARCH */}
        {activeTab === "search" && (
          <div className="space-y-4 animate-fade-up">
            <div className="relative">
              <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Поиск постов, людей, тегов..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pl-12 rounded-xl h-12"
              />
            </div>
            {searchQuery ? (
              <div className="space-y-3">
                <p className="text-white/40 text-sm">Результаты по «{searchQuery}»</p>
                {filteredPosts.length === 0
                  ? <div className="fox-card p-8 text-center"><p className="text-4xl mb-3">🔍</p><p className="text-white/40">Ничего не найдено</p></div>
                  : filteredPosts.map(post => (
                      <div key={post.id} className="fox-card p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="w-7 h-7"><AvatarImage src={post.user.avatar} /><AvatarFallback>{post.user.name[0]}</AvatarFallback></Avatar>
                          <span className="text-sm font-medium text-white">{post.user.name}</span>
                          <span className="text-xs text-white/30">{post.time}</span>
                        </div>
                        <p className="text-white/70 text-sm">{post.text}</p>
                      </div>
                    ))
                }
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Популярные теги</p>
                <div className="flex flex-wrap gap-2">
                  {["закат", "разработка", "арт", "музыка", "путешествия", "еда", "кино", "спорт", "мода", "фото"].map(tag => (
                    <button key={tag} onClick={() => setSearchQuery(tag)} className="tag-badge cursor-pointer hover:bg-[rgba(255,107,26,0.25)] transition-all">#{tag}</button>
                  ))}
                </div>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider mt-4">Популярные авторы</p>
                {USERS.map(user => (
                  <div key={user.id} className="fox-card p-4 flex items-center gap-3">
                    <Avatar className="w-10 h-10"><AvatarImage src={user.avatar} /><AvatarFallback>{user.name[0]}</AvatarFallback></Avatar>
                    <div className="flex-1"><p className="font-semibold text-white text-sm">{user.name}</p><p className="text-white/40 text-xs">{user.handle}</p></div>
                    <span className="text-white/30 text-xs">{user.followers.toLocaleString()} подп.</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RECOMMENDATIONS */}
        {activeTab === "recommendations" && (
          <div className="space-y-4 animate-fade-up">
            <div className="fox-glass rounded-2xl p-5">
              <div className="flex items-center gap-3"><span className="text-2xl">✨</span><div><p className="font-bold text-white">Рекомендации для вас</p><p className="text-white/40 text-sm">На основе ваших интересов</p></div></div>
            </div>
            <div className="fox-card p-4 space-y-4">
              <p className="text-xs text-white/40 uppercase tracking-wider font-medium">Люди, которых вы можете знать</p>
              {RECOMMENDED.map(({ user, mutual }) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="story-ring"><div className="bg-[var(--fox-bg)] p-[2px] rounded-full"><Avatar className="w-11 h-11"><AvatarImage src={user.avatar} /><AvatarFallback>{user.name[0]}</AvatarFallback></Avatar></div></div>
                  <div className="flex-1 min-w-0"><p className="font-semibold text-white text-sm">{user.name}</p><p className="text-white/40 text-xs">{mutual} общих</p></div>
                  <button
                    onClick={() => handleFollow(user.id)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${following.includes(user.id) ? "bg-white/10 text-white/60 hover:bg-red-500/20 hover:text-red-400" : "fox-gradient text-white hover:opacity-90 fox-glow-orange"}`}
                  >
                    {following.includes(user.id) ? "Подписан" : "Подписаться"}
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/40 uppercase tracking-wider font-medium px-1">Популярные посты</p>
            {[...posts].sort((a, b) => b.likes - a.likes).slice(0, 3).map(post => (
              <div key={post.id} className="fox-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-8 h-8"><AvatarImage src={post.user.avatar} /><AvatarFallback>{post.user.name[0]}</AvatarFallback></Avatar>
                  <div><p className="text-sm font-medium text-white">{post.user.name}</p><p className="text-xs text-white/30">{post.user.handle}</p></div>
                  <div className="ml-auto flex items-center gap-1 text-[var(--fox-pink)] text-sm font-semibold">
                    <Icon name="Heart" size={14} className="fill-[var(--fox-pink)] text-[var(--fox-pink)]" />{post.likes.toLocaleString()}
                  </div>
                </div>
                <p className="text-white/70 text-sm">{post.text}</p>
                {post.image && <img src={post.image} className="mt-3 rounded-xl w-full h-40 object-cover" alt="post" />}
              </div>
            ))}
          </div>
        )}

        {/* MESSAGES */}
        {activeTab === "messages" && (
          <div className="animate-fade-up">
            {!activeChat ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-white">Сообщения</h2>
                  <button className="p-2 rounded-xl hover:bg-white/8 text-white/40 hover:text-[var(--fox-orange)] transition-all"><Icon name="PenSquare" size={20} /></button>
                </div>
                <div className="relative mb-4">
                  <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <Input placeholder="Поиск сообщений..." className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pl-10 rounded-xl h-10 text-sm" />
                </div>
                {MESSAGES.map(msg => (
                  <button key={msg.id} onClick={() => setActiveChat(msg.id)} className="fox-card p-4 flex items-center gap-3 w-full text-left hover:border-white/15 transition-all">
                    <div className="relative">
                      <Avatar className="w-12 h-12"><AvatarImage src={msg.user.avatar} /><AvatarFallback>{msg.user.name[0]}</AvatarFallback></Avatar>
                      {msg.unread > 0 && <span className="absolute -top-1 -right-1 bg-[var(--fox-orange)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{msg.unread}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-white text-sm">{msg.user.name}</p>
                        <p className="text-white/30 text-xs">{msg.time}</p>
                      </div>
                      <p className={`text-sm truncate mt-0.5 ${msg.unread > 0 ? "text-white/70 font-medium" : "text-white/40"}`}>{msg.text}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col h-[calc(100vh-120px)]">
                <div className="flex items-center gap-3 mb-4">
                  <button onClick={() => setActiveChat(null)} className="p-2 rounded-xl hover:bg-white/8 text-white/50 hover:text-white transition-all"><Icon name="ArrowLeft" size={20} /></button>
                  {(() => { const msg = MESSAGES.find(m => m.id === activeChat)!; return (<><Avatar className="w-10 h-10"><AvatarImage src={msg.user.avatar} /><AvatarFallback>{msg.user.name[0]}</AvatarFallback></Avatar><div><p className="font-semibold text-white text-sm">{msg.user.name}</p><p className="text-xs text-green-400">онлайн</p></div></>); })()}
                </div>
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto pb-4">
                  {[
                    { text: "Привет! Видел твой новый пост — огонь 🔥", mine: false, time: "10:20" },
                    { text: "Спасибо! Долго работал над ним)", mine: true, time: "10:22" },
                    { text: "Слушай, а ты планируешь что-то новое?", mine: false, time: "10:23" },
                    { text: "Да! Скоро анонс, следи за лентой 👀", mine: true, time: "10:25" },
                  ].map((m, i) => (
                    <div key={i} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${m.mine ? "fox-gradient text-white rounded-br-sm" : "bg-white/8 text-white/80 rounded-bl-sm"}`}>
                        {m.text}
                        <p className={`text-xs mt-1 ${m.mine ? "text-white/60" : "text-white/30"}`}>{m.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-auto">
                  <Input value={messageInput} onChange={e => setMessageInput(e.target.value)} placeholder="Написать сообщение..." className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl" onKeyDown={e => e.key === "Enter" && setMessageInput("")} />
                  <button onClick={() => setMessageInput("")} className="fox-gradient w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-all fox-glow-orange">
                    <Icon name="Send" size={18} className="text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div className="space-y-3 animate-fade-up">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-white">Уведомления</h2>
              <button className="text-[var(--fox-orange)] text-sm hover:opacity-70 transition-opacity">Прочитать все</button>
            </div>
            {NOTIFICATIONS.map((notif, idx) => (
              <div key={notif.id} className={`fox-card p-4 flex items-center gap-3 transition-all animate-fade-up ${!notif.read ? "border-[var(--fox-orange)]/20" : ""}`} style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!notif.read ? "bg-[rgba(255,107,26,0.15)]" : "bg-white/5"}`}>
                  <Icon name={notif.icon} size={18} className={notif.color} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${!notif.read ? "text-white font-medium" : "text-white/60"}`}>{notif.text}</p>
                  <p className="text-xs text-white/30 mt-0.5">{notif.time} назад</p>
                </div>
                {!notif.read && <div className="w-2 h-2 rounded-full bg-[var(--fox-orange)] flex-shrink-0 notification-dot" />}
              </div>
            ))}
          </div>
        )}

        {/* PROFILE */}
        {activeTab === "profile" && (
          <div className="animate-fade-up">
            <div className="fox-card overflow-hidden mb-4">
              <div className="h-36 relative">
                <div className="absolute inset-0" style={{ backgroundImage: `url(${POST_IMG})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                <div className="absolute inset-0 fox-gradient opacity-60" />
              </div>
              <div className="px-5 pb-5">
                <div className="flex items-end justify-between -mt-8 mb-4">
                  <div className="story-ring cursor-pointer" onClick={() => { setDraftAvatar(myAvatar); openModal("avatar"); }}>
                    <div className="bg-[var(--fox-surface)] p-1 rounded-full">
                      {useCustomAvatar
                        ? <AvatarPreview config={myAvatar} size={80} />
                        : <Avatar className="w-20 h-20"><AvatarImage src={AVATAR_ME} /><AvatarFallback>АФ</AvatarFallback></Avatar>
                      }
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setDraftAvatar(myAvatar); openModal("avatar"); }}
                      className="fox-gradient text-white text-xs font-semibold px-3 py-2 rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5"
                    >
                      <Icon name="Palette" size={14} />
                      Аватар
                    </button>
                    <button className="fox-glass text-white text-sm font-medium px-4 py-2 rounded-xl hover:border-white/20 transition-all">
                      Редактировать
                    </button>
                  </div>
                </div>
                <h1 className="text-xl font-bold text-white">{USERS[0].name}</h1>
                <p className="text-white/40 text-sm">{USERS[0].handle}</p>
                <p className="text-white/70 text-sm mt-2">{USERS[0].bio}</p>
                <div className="flex gap-6 mt-4">
                  {[{ label: "Постов", value: posts.filter(p => p.user.id === 1).length }, { label: "Подписчиков", value: "4 820" }, { label: "Подписок", value: USERS[0].following }].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <p className="font-bold text-white text-lg">{value}</p>
                      <p className="text-white/40 text-xs">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="fox-card p-4">
              <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-4">Публикации</p>
              <div className="grid grid-cols-3 gap-2">
                {[POST_IMG, FOX_LOGO, AVATAR_ME, POST_IMG, FOX_LOGO, AVATAR_ME].map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative">
                    <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-white text-sm font-semibold">
                        <Icon name="Heart" size={14} className="fill-white text-white" />
                        {[342, 89, 1203, 187, 45, 230][i]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Right sidebar ── */}
      <aside className="w-72 h-screen sticky top-0 px-4 py-6 hidden xl:flex flex-col gap-4">
        <div className="fox-card p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-3">В тренде</p>
          <div className="space-y-3">
            {["#ФоксНет", "#Разработка2026", "#АртТренд", "#МузыкаНедели"].map((tag, i) => (
              <div key={tag} className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-[var(--fox-orange)] transition-all">{tag}</p>
                  <p className="text-xs text-white/30">{[12, 8, 6, 4][i]}K постов</p>
                </div>
                <span className="text-white/20 text-sm font-bold">#{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="fox-card p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-3">Подписаться</p>
          <div className="space-y-3">
            {RECOMMENDED.map(({ user }) => (
              <div key={user.id} className="flex items-center gap-3">
                <Avatar className="w-9 h-9"><AvatarImage src={user.avatar} /><AvatarFallback>{user.name[0]}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-white/30 truncate">{user.handle}</p>
                </div>
                <button
                  onClick={() => handleFollow(user.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${following.includes(user.id) ? "text-white/40 bg-white/5" : "text-[var(--fox-orange)] bg-[rgba(255,107,26,0.12)] hover:bg-[rgba(255,107,26,0.2)]"}`}
                >
                  {following.includes(user.id) ? "✓" : "+"}
                </button>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/15 text-xs px-1">FoxNet © 2026 · Политика · Помощь</p>
      </aside>
    </div>
  );
}
