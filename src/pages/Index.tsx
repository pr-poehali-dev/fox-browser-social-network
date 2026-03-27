import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const AVATAR_ME = "https://cdn.poehali.dev/projects/7b751f83-bce2-4c5c-85bb-dd33146e6f01/files/59fa87ae-39f4-4603-a7ea-c17dd1f4386c.jpg";
const POST_IMG  = "https://cdn.poehali.dev/projects/7b751f83-bce2-4c5c-85bb-dd33146e6f01/files/58f0c6ab-d7c3-40f7-a67a-29f806a25006.jpg";
const FOX_LOGO  = "https://cdn.poehali.dev/projects/7b751f83-bce2-4c5c-85bb-dd33146e6f01/files/a5b04cb9-22a4-44c7-8460-debf5baebd29.jpg";

// ── Avatar builder ───────────────────────────────────────────────────────────
const AVATAR_FACES = [
  "🦊","🐺","🐱","🐸","🦁","🐨","🐼","🦝","🐙","🦋",
  "🐧","🦚","🦜","🐬","🦈","🐲","🦄","🐺","🦅","🐯",
  "🧑","👩","👨","🧔","👱","🧕","🧙","🧝","🧛","🤖",
];
const AVATAR_COLORS = [
  { label: "Океан",    value: "linear-gradient(135deg,#0DCCB1,#1E8FFF)" },
  { label: "Лес",      value: "linear-gradient(135deg,#0FE086,#0DCCB1)" },
  { label: "Небо",     value: "linear-gradient(135deg,#00D4FF,#1E8FFF)" },
  { label: "Ночь",     value: "linear-gradient(135deg,#0F2027,#203A43,#2C5364)" },
  { label: "Аврора",   value: "linear-gradient(135deg,#0DCCB1,#00D4FF,#1E8FFF)" },
  { label: "Изумруд",  value: "linear-gradient(135deg,#11998e,#38ef7d)" },
  { label: "Сапфир",   value: "linear-gradient(135deg,#1565C0,#42A5F5)" },
  { label: "Мята",     value: "linear-gradient(135deg,#00b09b,#96c93d)" },
  { label: "Закат",    value: "linear-gradient(135deg,#FF6B1A,#FF2D78)" },
  { label: "Фиолет",   value: "linear-gradient(135deg,#8B2FFF,#EC4899)" },
  { label: "Золото",   value: "linear-gradient(135deg,#F7971E,#FFD200)" },
  { label: "Рубин",    value: "linear-gradient(135deg,#C94B4B,#4B134F)" },
];
const AVATAR_ACCESSORIES = ["","🕶️","🎩","👑","🎀","⭐","💎","🌟","🔥","❄️","🌈","⚡","🎭","🎪","🎯","🏆"];
const AVATAR_FRAMES = [
  { label: "Нет",      value: "" },
  { label: "Неон",     value: "0 0 0 3px #0DCCB1, 0 0 20px rgba(13,204,177,0.5)" },
  { label: "Синий",    value: "0 0 0 3px #1E8FFF, 0 0 20px rgba(30,143,255,0.5)" },
  { label: "Радуга",   value: "0 0 0 3px #FF2D78, 0 0 15px rgba(255,45,120,0.4)" },
  { label: "Золото",   value: "0 0 0 3px #FFD200, 0 0 20px rgba(255,210,0,0.4)" },
];

type AvatarConfig = { face: string; color: string; accessory: string; frame: string };
const DEFAULT_AVATAR: AvatarConfig = { face: "🦊", color: AVATAR_COLORS[0].value, accessory: "", frame: "" };

function AvatarPreview({ config, size = 48 }: { config: AvatarConfig; size?: number }) {
  return (
    <div style={{
      width: size, height: size, background: config.color, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, position: "relative", boxShadow: config.frame || undefined,
    }}>
      <span style={{ fontSize: size * 0.45, lineHeight: 1 }}>{config.face}</span>
      {config.accessory && (
        <span style={{ position: "absolute", top: -size * 0.1, right: -size * 0.05, fontSize: size * 0.3, lineHeight: 1 }}>
          {config.accessory}
        </span>
      )}
    </div>
  );
}

// ── Types ────────────────────────────────────────────────────────────────────
const USERS_DATA = [
  { id: 1, name: "Алиса Фокс",  handle: "@alice_fox",  avatar: AVATAR_ME, bio: "Дизайнер • Фотограф • Путешественница 🦊", followers: 4820, following: 312, posts: 89,  city: "Москва",   website: "alice.foxnet.app" },
  { id: 2, name: "Макс Вольф",  handle: "@max_wolf",   avatar: FOX_LOGO,  bio: "Frontend dev & coffee lover",                followers: 2100, following: 180, posts: 45,  city: "Питер",    website: "" },
  { id: 3, name: "Соня Ривер",  handle: "@sonya_r",    avatar: POST_IMG,  bio: "Художник | Иллюстратор",                     followers: 9300, following: 521, posts: 203, city: "Казань",   website: "sonya.art" },
];

type UserData = typeof USERS_DATA[0];
type Comment  = { id: number; user: UserData; text: string; time: string };
type Story    = { id: number; user: UserData; image: string; text: string; viewed: boolean; bg: string };
type Post = {
  id: number; user: UserData; text: string; image: string | null;
  likes: number; comments: number; reposts: number; liked: boolean;
  time: string; tags: string[]; commentList: Comment[];
  repostOf?: { user: UserData; text: string; image: string | null };
};

const INITIAL_STORIES: Story[] = [
  { id: 1, user: USERS_DATA[1], image: POST_IMG,  text: "Новый проект запущен! 🚀", viewed: false, bg: "linear-gradient(135deg,#0DCCB1,#1E8FFF)" },
  { id: 2, user: USERS_DATA[2], image: FOX_LOGO,  text: "Иллюстрация готова ✨",    viewed: false, bg: "linear-gradient(135deg,#0FE086,#0DCCB1)" },
  { id: 3, user: USERS_DATA[1], image: AVATAR_ME, text: "Хороший день ☀️",          viewed: true,  bg: "linear-gradient(135deg,#1E8FFF,#00D4FF)" },
];

const INITIAL_POSTS: Post[] = [
  { id: 1, user: USERS_DATA[0], text: "Сегодня закат был просто нереальный 🌅", image: POST_IMG, likes: 342, comments: 2, reposts: 14, liked: false, time: "2 мин назад", tags: ["закат","настроение"],
    commentList: [{ id: 1, user: USERS_DATA[1], text: "Потрясающий кадр! 🔥", time: "1 мин" }, { id: 2, user: USERS_DATA[2], text: "Такая красота, хочу туда!", time: "только что" }] },
  { id: 2, user: USERS_DATA[1], text: "Запустил новый проект! Месяц работы — наконец live 🚀", image: null, likes: 187, comments: 1, reposts: 22, liked: false, time: "15 мин", tags: ["разработка","релиз"],
    commentList: [{ id: 1, user: USERS_DATA[2], text: "Поздравляю! Ждём ссылку 😄", time: "10 мин" }] },
  { id: 3, user: USERS_DATA[2], text: "Новая иллюстрация для книги! Три недели работы ✨", image: FOX_LOGO, likes: 1203, comments: 0, reposts: 67, liked: false, time: "1 ч назад", tags: ["арт","иллюстрация"], commentList: [] },
  { id: 4, user: USERS_DATA[0], text: "Матча-латте с кокосовым молоком — 10/10 ☕", image: null, likes: 89, comments: 0, reposts: 5, liked: false, time: "3 ч назад", tags: ["еда","кофе"], commentList: [] },
];

const NOTIFICATIONS = [
  { id: 1, icon: "Heart",          color: "text-pink-400",   text: "Макс Вольф поставил лайк",          time: "2 мин",  read: false },
  { id: 2, icon: "UserPlus",       color: "text-[#0DCCB1]",  text: "Соня Ривер подписалась на вас",     time: "10 мин", read: false },
  { id: 3, icon: "MessageCircle",  color: "text-blue-400",   text: "Новый комментарий: «Потрясающе!»",  time: "1 ч",    read: true },
  { id: 4, icon: "Repeat2",        color: "text-green-400",  text: "Ваш пост репостнули 3 раза",        time: "2 ч",    read: true },
  { id: 5, icon: "Star",           color: "text-yellow-400", text: "Пост попал в рекомендации",         time: "5 ч",    read: true },
];

const RECOMMENDED = [
  { id: 1, user: USERS_DATA[1], mutual: 12 },
  { id: 2, user: USERS_DATA[2], mutual: 8 },
  { id: 3, user: { id: 4, name: "Рита Звезда", handle: "@rita_star", avatar: POST_IMG, followers: 6500, following: 0, posts: 0, bio: "", city: "", website: "" }, mutual: 3 },
];

const MESSAGES = [
  { id: 1, user: USERS_DATA[1], text: "Привет! Видел твой новый пост — огонь 🔥", time: "10:23", unread: 2 },
  { id: 2, user: USERS_DATA[2], text: "Спасибо за фидбек по иллюстрации!",          time: "Вчера",  unread: 0 },
  { id: 3, user: USERS_DATA[0], text: "Когда встретимся?",                           time: "Пн",     unread: 0 },
];

type Tab     = "feed"|"profile"|"messages"|"notifications"|"search"|"recommendations";
type Modal   = "none"|"comments"|"repost"|"share"|"avatar"|"story"|"editProfile";

// ── PostCard Component ────────────────────────────────────────────────────────
function PostCard({ post, onLike, onComments, onRepost, onShare }: {
  post: Post;
  onLike: (id: number) => void;
  onComments: (id: number) => void;
  onRepost: (id: number) => void;
  onShare: (id: number) => void;
}) {
  return (
    <div className="fn-card p-4 post-card">
      {post.repostOf && (
        <div className="mb-3 pl-3 border-l-2 border-[var(--fn-teal)]/40 opacity-70">
          <p className="text-xs text-white/40 mb-1">↩ Репост от {post.repostOf.user.name}</p>
          <p className="text-white/60 text-xs line-clamp-2">{post.repostOf.text}</p>
          {post.repostOf.image && <img src={post.repostOf.image} className="mt-1 rounded-lg w-full h-20 object-cover" alt="" />}
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="story-ring flex-shrink-0">
          <div className="bg-[var(--fn-bg)] p-[2px] rounded-full">
            <Avatar className="w-10 h-10"><AvatarImage src={post.user.avatar} /><AvatarFallback>{post.user.name[0]}</AvatarFallback></Avatar>
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
        <button className={`like-btn flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/5 ${post.liked ? "text-[var(--fn-pink)]" : "text-white/40"}`} onClick={() => onLike(post.id)}>
          <Icon name="Heart" size={18} className={post.liked ? "fill-[var(--fn-pink)] text-[var(--fn-pink)]" : ""} />
          <span className="text-xs font-medium">{post.likes}</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-blue-400 transition-all" onClick={() => onComments(post.id)}>
          <Icon name="MessageCircle" size={18} />
          <span className="text-xs font-medium">{post.comments}</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-green-400 transition-all" onClick={() => onRepost(post.id)}>
          <Icon name="Repeat2" size={18} />
          <span className="text-xs font-medium">{post.reposts}</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-[var(--fn-teal)] transition-all ml-auto" onClick={() => onShare(post.id)}>
          <Icon name="Share2" size={18} />
        </button>
      </div>
    </div>
  );
}

// ── Story Viewer ──────────────────────────────────────────────────────────────
function StoryViewer({ stories, startIdx, onClose, onViewed }: {
  stories: Story[]; startIdx: number; onClose: () => void; onViewed: (id: number) => void;
}) {
  const [idx, setIdx] = useState(startIdx);
  const story = stories[idx];

  useEffect(() => { onViewed(story.id); }, [story.id]);

  const prev = () => { if (idx > 0) setIdx(idx - 1); else onClose(); };
  const next = () => { if (idx < stories.length - 1) setIdx(idx + 1); else onClose(); };

  useEffect(() => {
    const t = setTimeout(next, 5000);
    return () => clearTimeout(t);
  }, [idx]);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90" onClick={onClose}>
      <div className="relative w-full max-w-sm mx-4 animate-story" onClick={e => e.stopPropagation()}>
        {/* Progress bar */}
        <div className="flex gap-1 mb-3 px-2">
          {stories.map((s, i) => (
            <div key={s.id} className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden">
              <div className={`h-full bg-white rounded-full ${i === idx ? "animate-[progress-bar_5s_linear_forwards]" : i < idx ? "w-full" : "w-0"}`} />
            </div>
          ))}
        </div>
        {/* Header */}
        <div className="flex items-center gap-3 px-2 mb-4">
          <Avatar className="w-9 h-9 ring-2 ring-[var(--fn-teal)]">
            <AvatarImage src={story.user.avatar} /><AvatarFallback>{story.user.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-white font-semibold text-sm">{story.user.name}</span>
          <span className="text-white/40 text-xs ml-1">сейчас</span>
          <button onClick={onClose} className="ml-auto text-white/60 hover:text-white transition-colors"><Icon name="X" size={20} /></button>
        </div>
        {/* Story image */}
        <div className="rounded-2xl overflow-hidden relative aspect-[9/16] max-h-[70vh]">
          <img src={story.image} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0" style={{ background: story.bg, opacity: 0.35 }} />
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white font-semibold text-lg">{story.text}</p>
          </div>
          {/* Tap zones */}
          <button className="absolute inset-y-0 left-0 w-1/3" onClick={prev} />
          <button className="absolute inset-y-0 right-0 w-1/3" onClick={next} />
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Index() {
  const [activeTab, setActiveTab]         = useState<Tab>("feed");
  const [posts, setPosts]                 = useState<Post[]>(INITIAL_POSTS);
  const [stories, setStories]             = useState<Story[]>(INITIAL_STORIES);
  const [searchQuery, setSearchQuery]     = useState("");
  const [newPostText, setNewPostText]     = useState("");
  const [newPostImage, setNewPostImage]   = useState<string | null>(null);
  const [following, setFollowing]         = useState<number[]>([]);
  const [activeChat, setActiveChat]       = useState<number | null>(null);
  const [messageInput, setMessageInput]   = useState("");

  // modals
  const [modal, setModal]               = useState<Modal>("none");
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [commentText, setCommentText]   = useState("");
  const [repostText, setRepostText]     = useState("");
  const [shareCopied, setShareCopied]   = useState(false);

  // story viewer
  const [storyViewIdx, setStoryViewIdx] = useState(0);

  // story creation
  const [newStoryText, setNewStoryText] = useState("");
  const [newStoryImg, setNewStoryImg]   = useState<string | null>(null);
  const [newStoryBg, setNewStoryBg]     = useState(AVATAR_COLORS[0].value);
  const storyFileRef = useRef<HTMLInputElement>(null);

  // avatar builder
  const [myAvatar, setMyAvatar]           = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [draftAvatar, setDraftAvatar]     = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [useCustomAvatar, setUseCustomAvatar] = useState(false);
  const [avatarTab, setAvatarTab]         = useState<"face"|"color"|"acc"|"frame">("face");

  // profile editing
  const [profile, setProfile] = useState({ name: "Алиса Фокс", handle: "@alice_fox", bio: "Дизайнер • Фотограф • Путешественница 🦊", city: "Москва", website: "alice.foxnet.app" });
  const [draftProfile, setDraftProfile] = useState(profile);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverGradient, setCoverGradient] = useState("linear-gradient(135deg,#0DCCB1,#1E8FFF)");
  const coverFileRef = useRef<HTMLInputElement>(null);

  const fileInputRef    = useRef<HTMLInputElement>(null);

  const activePost = posts.find(p => p.id === activePostId) ?? null;

  const openModal = (m: Modal, postId?: number) => {
    setActivePostId(postId ?? null);
    setModal(m);
    setCommentText(""); setRepostText("");
  };
  const closeModal = () => { setModal("none"); setActivePostId(null); };

  const handleLike = (postId: number) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !activePostId) return;
    setPosts(prev => prev.map(p =>
      p.id === activePostId
        ? { ...p, comments: p.comments + 1, commentList: [...p.commentList, { id: Date.now(), user: USERS_DATA[0], text: commentText.trim(), time: "только что" }] }
        : p
    ));
    setCommentText("");
  };

  const handleRepost = () => {
    if (!activePost) return;
    const np: Post = {
      id: Date.now(), user: USERS_DATA[0], text: repostText.trim(), image: null,
      likes: 0, comments: 0, reposts: 0, liked: false, time: "только что", tags: [], commentList: [],
      repostOf: { user: activePost.user, text: activePost.text, image: activePost.image },
    };
    setPosts(prev => [np, ...prev.map(p => p.id === activePostId ? { ...p, reposts: p.reposts + 1 } : p)]);
    closeModal();
  };

  const handleShare = () => {
    navigator.clipboard.writeText("https://foxnet.app/post/" + activePostId).catch(() => {});
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handlePost = () => {
    if (!newPostText.trim() && !newPostImage) return;
    const np: Post = {
      id: Date.now(), user: USERS_DATA[0], text: newPostText, image: newPostImage,
      likes: 0, comments: 0, reposts: 0, liked: false, time: "только что", tags: [], commentList: [],
    };
    setPosts(prev => [np, ...prev]);
    setNewPostText(""); setNewPostImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setNewPostImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleStoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setNewStoryImg(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddStory = () => {
    if (!newStoryText.trim() && !newStoryImg) return;
    const ns: Story = {
      id: Date.now(), user: USERS_DATA[0],
      image: newStoryImg ?? POST_IMG,
      text: newStoryText || "Мой сторис",
      viewed: false, bg: newStoryBg,
    };
    setStories(prev => [ns, ...prev]);
    setNewStoryText(""); setNewStoryImg(null); setNewStoryBg(AVATAR_COLORS[0].value);
    closeModal();
  };

  const handleFollow = (userId: number) => setFollowing(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  const saveAvatar = () => { setMyAvatar(draftAvatar); setUseCustomAvatar(true); closeModal(); };
  const saveProfile = () => { setProfile(draftProfile); closeModal(); };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setCoverImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const filteredPosts = posts.filter(p =>
    p.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const unreadNotifs = NOTIFICATIONS.filter(n => !n.read).length;

  const navItems: { id: Tab; icon: string; label: string; badge?: number }[] = [
    { id: "feed",            icon: "Home",          label: "Лента" },
    { id: "search",          icon: "Search",        label: "Поиск" },
    { id: "recommendations", icon: "Sparkles",      label: "Рекомендации" },
    { id: "messages",        icon: "MessageCircle", label: "Сообщения", badge: 2 },
    { id: "notifications",   icon: "Bell",          label: "Уведомления", badge: unreadNotifs },
    { id: "profile",         icon: "User",          label: "Профиль" },
  ];

  const MyAvatarEl = ({ size = 40 }: { size?: number }) => useCustomAvatar
    ? <AvatarPreview config={myAvatar} size={size} />
    : <Avatar style={{ width: size, height: size }}><AvatarImage src={AVATAR_ME} /><AvatarFallback>АФ</AvatarFallback></Avatar>;

  return (
    <div className="min-h-screen mesh-bg flex font-golos">

      {/* ── Story Viewer ── */}
      {modal === "story" && (
        <StoryViewer
          stories={stories}
          startIdx={storyViewIdx}
          onClose={closeModal}
          onViewed={id => setStories(prev => prev.map(s => s.id === id ? { ...s, viewed: true } : s))}
        />
      )}

      {/* ── Modals ── */}
      {modal !== "none" && modal !== "story" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeModal}>
          <div className="w-full max-w-lg fn-card p-6 animate-fade-up" onClick={e => e.stopPropagation()}>

            {/* COMMENTS */}
            {modal === "comments" && activePost && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-lg">Комментарии</h3>
                  <button onClick={closeModal} className="text-white/40 hover:text-white"><Icon name="X" size={20} /></button>
                </div>
                <div className="fn-glass rounded-xl p-3 mb-4">
                  <p className="text-white/70 text-sm line-clamp-2">{activePost.text}</p>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                  {activePost.commentList.length === 0 && <p className="text-white/30 text-sm text-center py-4">Будь первым 🦊</p>}
                  {activePost.commentList.map(c => (
                    <div key={c.id} className="flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0"><AvatarImage src={c.user.avatar} /><AvatarFallback>{c.user.name[0]}</AvatarFallback></Avatar>
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
                  <Input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Написать комментарий..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                    onKeyDown={e => e.key === "Enter" && handleAddComment()} />
                  <button onClick={handleAddComment} disabled={!commentText.trim()}
                    className="fn-gradient w-11 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:opacity-90 fn-glow">
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
                  <button onClick={closeModal} className="text-white/40 hover:text-white"><Icon name="X" size={20} /></button>
                </div>
                <Textarea value={repostText} onChange={e => setRepostText(e.target.value)} placeholder="Добавь своё мнение... (необязательно)"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none rounded-xl min-h-[80px] mb-3" />
                <div className="fn-glass rounded-xl p-3 mb-4 border-l-2 border-[var(--fn-teal)]/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="w-6 h-6"><AvatarImage src={activePost.user.avatar} /><AvatarFallback>{activePost.user.name[0]}</AvatarFallback></Avatar>
                    <span className="text-xs font-medium text-white">{activePost.user.name}</span>
                  </div>
                  <p className="text-white/60 text-sm line-clamp-3">{activePost.text}</p>
                  {activePost.image && <img src={activePost.image} className="mt-2 rounded-lg h-24 w-full object-cover" alt="" />}
                </div>
                <div className="flex gap-2">
                  <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl text-sm text-white/50 bg-white/5 hover:bg-white/10 transition-all">Отмена</button>
                  <button onClick={handleRepost} className="flex-1 py-2.5 rounded-xl text-sm font-semibold fn-gradient text-white hover:opacity-90 fn-glow">Репостнуть</button>
                </div>
              </>
            )}

            {/* SHARE */}
            {modal === "share" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-lg">Поделиться</h3>
                  <button onClick={closeModal} className="text-white/40 hover:text-white"><Icon name="X" size={20} /></button>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[{icon:"MessageCircle",label:"Telegram",color:"bg-blue-500/20 text-blue-400"},{icon:"Twitter",label:"Twitter",color:"bg-sky-500/20 text-sky-400"},{icon:"Mail",label:"Email",color:"bg-[rgba(13,204,177,0.15)] text-[#0DCCB1]"},{icon:"QrCode",label:"QR-код",color:"bg-violet-500/20 text-violet-400"}].map(({icon,label,color}) => (
                    <button key={icon} className={`flex flex-col items-center gap-2 p-3 rounded-xl ${color} hover:opacity-80 transition-all`}>
                      <Icon name={icon} size={22} /><span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/50 truncate">https://foxnet.app/post/{activePostId}</div>
                  <button onClick={handleShare} className={`px-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${shareCopied ? "bg-green-500/20 text-green-400" : "fn-gradient text-white hover:opacity-90"}`}>
                    <Icon name={shareCopied ? "Check" : "Copy"} size={16} />
                    {shareCopied ? "Скопировано!" : "Копировать"}
                  </button>
                </div>
              </>
            )}

            {/* ADD STORY */}
            {modal === "editProfile" && modal === "editProfile" ? null : null}
            {modal === "editProfile" && (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-white text-lg">Редактировать профиль</h3>
                  <button onClick={closeModal} className="text-white/40 hover:text-white"><Icon name="X" size={20} /></button>
                </div>
                <div className="flex justify-center mb-5">
                  <div className="relative cursor-pointer" onClick={() => { setDraftAvatar(myAvatar); setModal("avatar"); }}>
                    <MyAvatarEl size={72} />
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Icon name="Camera" size={20} className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {([["name","Имя"],["handle","Никнейм"],["bio","О себе"],["city","Город"],["website","Сайт"]] as [keyof typeof draftProfile, string][]).map(([field, label]) => (
                    <div key={field}>
                      <p className="text-xs text-white/40 mb-1 font-medium">{label}</p>
                      {field === "bio"
                        ? <Textarea value={draftProfile[field]} onChange={e => setDraftProfile(d => ({...d,[field]:e.target.value}))}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl resize-none min-h-[70px] text-sm" />
                        : <Input value={draftProfile[field]} onChange={e => setDraftProfile(d => ({...d,[field]:e.target.value}))}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl text-sm" />
                      }
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-5">
                  <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl text-sm text-white/50 bg-white/5 hover:bg-white/10 transition-all">Отмена</button>
                  <button onClick={saveProfile} className="flex-1 py-2.5 rounded-xl text-sm font-semibold fn-gradient text-white hover:opacity-90 fn-glow">Сохранить</button>
                </div>
              </>
            )}

            {/* AVATAR BUILDER */}
            {modal === "avatar" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-lg">Конструктор аватара</h3>
                  <button onClick={closeModal} className="text-white/40 hover:text-white"><Icon name="X" size={20} /></button>
                </div>
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <AvatarPreview config={draftAvatar} size={88} />
                    <div className="absolute -bottom-1 -right-1 bg-[var(--fn-surface)] rounded-full p-1 border border-white/10">
                      <Icon name="Sparkles" size={13} className="text-[var(--fn-teal)]" />
                    </div>
                  </div>
                </div>
                {/* Tabs */}
                <div className="flex gap-1 mb-4 bg-white/5 rounded-xl p-1">
                  {([["face","Персонаж"],["color","Фон"],["acc","Аксессуар"],["frame","Рамка"]] as [typeof avatarTab, string][]).map(([t, label]) => (
                    <button key={t} onClick={() => setAvatarTab(t)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${avatarTab === t ? "fn-gradient text-white" : "text-white/40 hover:text-white/70"}`}>
                      {label}
                    </button>
                  ))}
                </div>

                {avatarTab === "face" && (
                  <div className="grid grid-cols-8 gap-2 max-h-44 overflow-y-auto">
                    {AVATAR_FACES.map(face => (
                      <button key={face} onClick={() => setDraftAvatar(d => ({...d,face}))}
                        className={`h-10 rounded-xl text-xl flex items-center justify-center transition-all ${draftAvatar.face === face ? "bg-[rgba(13,204,177,0.2)] ring-2 ring-[var(--fn-teal)]" : "bg-white/5 hover:bg-white/10"}`}>
                        {face}
                      </button>
                    ))}
                  </div>
                )}
                {avatarTab === "color" && (
                  <div className="grid grid-cols-6 gap-2">
                    {AVATAR_COLORS.map(c => (
                      <button key={c.value} title={c.label} onClick={() => setDraftAvatar(d => ({...d,color:c.value}))}
                        className={`h-10 rounded-xl transition-all ${draftAvatar.color === c.value ? "ring-2 ring-white scale-105" : "hover:scale-105"}`}
                        style={{ background: c.value }} />
                    ))}
                  </div>
                )}
                {avatarTab === "acc" && (
                  <div className="grid grid-cols-8 gap-2">
                    {AVATAR_ACCESSORIES.map((acc, i) => (
                      <button key={i} onClick={() => setDraftAvatar(d => ({...d,accessory:acc}))}
                        className={`h-10 rounded-xl text-xl flex items-center justify-center transition-all ${draftAvatar.accessory === acc ? "bg-[rgba(13,204,177,0.2)] ring-2 ring-[var(--fn-teal)]" : "bg-white/5 hover:bg-white/10"}`}>
                        {acc === "" ? <span className="text-white/30 text-[10px]">нет</span> : acc}
                      </button>
                    ))}
                  </div>
                )}
                {avatarTab === "frame" && (
                  <div className="grid grid-cols-5 gap-3">
                    {AVATAR_FRAMES.map(f => (
                      <button key={f.label} onClick={() => setDraftAvatar(d => ({...d,frame:f.value}))}
                        className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${draftAvatar.frame === f.value ? "bg-[rgba(13,204,177,0.15)] ring-2 ring-[var(--fn-teal)]" : "bg-white/5 hover:bg-white/10"}`}>
                        <div style={{ width: 32, height: 32, background: draftAvatar.color, borderRadius: "50%", boxShadow: f.value || undefined }} />
                        <span className="text-[10px] text-white/50">{f.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-5">
                  <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl text-sm text-white/50 bg-white/5 hover:bg-white/10 transition-all">Отмена</button>
                  <button onClick={saveAvatar} className="flex-1 py-2.5 rounded-xl text-sm font-semibold fn-gradient text-white hover:opacity-90 fn-glow">Сохранить</button>
                </div>
              </>
            )}

            {/* NEW STORY */}
            {modal === "none" ? null : null}
          </div>
        </div>
      )}

      {/* NEW STORY MODAL (separate to avoid nesting issues) */}
      {modal === ("newStory" as Modal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeModal}>
          <div className="w-full max-w-sm fn-card p-6 animate-fade-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-lg">Создать сторис</h3>
              <button onClick={closeModal} className="text-white/40 hover:text-white"><Icon name="X" size={20} /></button>
            </div>
            <div
              className="rounded-2xl h-48 flex items-center justify-center mb-4 cursor-pointer relative overflow-hidden"
              style={{ background: newStoryBg }}
              onClick={() => storyFileRef.current?.click()}
            >
              {newStoryImg
                ? <img src={newStoryImg} className="absolute inset-0 w-full h-full object-cover" alt="" />
                : <div className="flex flex-col items-center gap-2 text-white/60">
                    <Icon name="ImagePlus" size={32} />
                    <span className="text-sm">Нажми, чтобы добавить фото</span>
                  </div>
              }
            </div>
            <input ref={storyFileRef} type="file" accept="image/*" className="hidden" onChange={handleStoryImageUpload} />
            <Input value={newStoryText} onChange={e => setNewStoryText(e.target.value)} placeholder="Текст сторис..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl mb-3 text-sm" />
            <div className="flex gap-2 mb-4 flex-wrap">
              {AVATAR_COLORS.slice(0,6).map(c => (
                <button key={c.value} onClick={() => setNewStoryBg(c.value)}
                  className={`w-8 h-8 rounded-full transition-all ${newStoryBg === c.value ? "ring-2 ring-white scale-110" : "hover:scale-105"}`}
                  style={{ background: c.value }} />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl text-sm text-white/50 bg-white/5 hover:bg-white/10 transition-all">Отмена</button>
              <button onClick={handleAddStory} disabled={!newStoryText.trim() && !newStoryImg}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold fn-gradient text-white disabled:opacity-40 hover:opacity-90 fn-glow">
                Опубликовать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className="w-64 h-screen sticky top-0 flex flex-col px-4 py-6 border-r border-white/5">
        <div className="flex items-center gap-3 px-4 mb-8">
          <div className="w-10 h-10 rounded-xl fn-gradient flex items-center justify-center text-xl fn-glow">🦊</div>
          <span className="text-2xl font-black fn-gradient-text tracking-tight">FoxNet</span>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`nav-item text-left w-full relative ${activeTab === item.id ? "active" : ""}`}>
              <Icon name={item.icon} size={20} />
              <span className="font-medium text-sm">{item.label}</span>
              {item.badge ? <span className="ml-auto bg-[var(--fn-teal)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{item.badge}</span> : null}
            </button>
          ))}
        </nav>
        <button onClick={() => setActiveTab("profile")} className="fn-glass rounded-xl p-3 flex items-center gap-3 hover:border-white/15 transition-all">
          <div className="story-ring"><MyAvatarEl size={36} /></div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold text-white truncate">{profile.name}</p>
            <p className="text-xs text-white/40 truncate">{profile.handle}</p>
          </div>
          <Icon name="MoreHorizontal" size={16} className="text-white/30" />
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 max-w-2xl mx-auto px-4 py-6">

        {/* FEED */}
        {activeTab === "feed" && (
          <div className="space-y-4 animate-fade-up">
            {/* Stories row */}
            <div className="fn-card p-4">
              <div className="flex gap-4 overflow-x-auto pb-1">
                {/* Add story button */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group" onClick={() => setModal("newStory" as Modal)}>
                  <div className="w-14 h-14 rounded-full fn-gradient flex items-center justify-center fn-glow group-hover:opacity-90 transition-opacity">
                    <Icon name="Plus" size={22} className="text-white" />
                  </div>
                  <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors">Создать</span>
                </div>
                {/* Existing stories */}
                {stories.map((story, i) => (
                  <div key={story.id} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group"
                    onClick={() => { setStoryViewIdx(i); openModal("story"); }}>
                    <div className={story.viewed ? "story-ring-viewed" : "story-ring"}>
                      <div className="bg-[var(--fn-bg)] p-[2px] rounded-full">
                        <Avatar className="w-12 h-12"><AvatarImage src={story.user.avatar} /><AvatarFallback>{story.user.name[0]}</AvatarFallback></Avatar>
                      </div>
                    </div>
                    <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors truncate max-w-[56px]">
                      {story.user.id === 1 ? "Вы" : story.user.name.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Composer */}
            <div className="fn-card p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0"><MyAvatarEl /></div>
                <div className="flex-1">
                  <Textarea value={newPostText} onChange={e => setNewPostText(e.target.value)} placeholder="Что у тебя нового, Фокс? 🦊"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none text-sm rounded-xl min-h-[70px]" />
                  {newPostImage && (
                    <div className="relative mt-2 rounded-xl overflow-hidden">
                      <img src={newPostImage} className="w-full h-40 object-cover" alt="preview" />
                      <button onClick={() => setNewPostImage(null)} className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-black/80">
                        <Icon name="X" size={14} />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                      <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg hover:bg-white/8 text-white/40 hover:text-[var(--fn-teal)] transition-all"><Icon name="Image" size={18} /></button>
                      <button className="p-2 rounded-lg hover:bg-white/8 text-white/40 hover:text-[var(--fn-teal)] transition-all"><Icon name="Smile" size={18} /></button>
                      <button className="p-2 rounded-lg hover:bg-white/8 text-white/40 hover:text-[var(--fn-teal)] transition-all"><Icon name="MapPin" size={18} /></button>
                    </div>
                    <button onClick={handlePost} disabled={!newPostText.trim() && !newPostImage}
                      className="fn-gradient text-white px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 hover:opacity-90 fn-glow">
                      Опубликовать
                    </button>
                  </div>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            {/* Posts */}
            {posts.map(post => (
              <PostCard key={post.id} post={post}
                onLike={handleLike}
                onComments={id => openModal("comments", id)}
                onRepost={id => openModal("repost", id)}
                onShare={id => openModal("share", id)}
              />
            ))}
          </div>
        )}

        {/* SEARCH */}
        {activeTab === "search" && (
          <div className="space-y-4 animate-fade-up">
            <div className="relative">
              <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Поиск постов, людей, тегов..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pl-12 rounded-xl h-12" />
            </div>
            {searchQuery ? (
              <div className="space-y-3">
                <p className="text-white/40 text-sm">Результаты по «{searchQuery}»</p>
                {filteredPosts.length === 0
                  ? <div className="fn-card p-8 text-center"><p className="text-4xl mb-3">🔍</p><p className="text-white/40">Ничего не найдено</p></div>
                  : filteredPosts.map(post => (
                      <div key={post.id} className="fn-card p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="w-7 h-7"><AvatarImage src={post.user.avatar} /><AvatarFallback>{post.user.name[0]}</AvatarFallback></Avatar>
                          <span className="text-sm font-medium text-white">{post.user.name}</span>
                          <span className="text-xs text-white/30 ml-auto">{post.time}</span>
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
                  {["закат","разработка","арт","музыка","путешествия","еда","кино","спорт","мода","фото"].map(tag => (
                    <button key={tag} onClick={() => setSearchQuery(tag)} className="tag-badge cursor-pointer hover:bg-[rgba(13,204,177,0.22)] transition-all">#{tag}</button>
                  ))}
                </div>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider mt-4">Популярные авторы</p>
                {USERS_DATA.map(user => (
                  <div key={user.id} className="fn-card p-4 flex items-center gap-3">
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
            <div className="fn-glass rounded-2xl p-5">
              <div className="flex items-center gap-3"><span className="text-2xl">✨</span><div><p className="font-bold text-white">Рекомендации для вас</p><p className="text-white/40 text-sm">На основе ваших интересов</p></div></div>
            </div>
            <div className="fn-card p-4 space-y-4">
              <p className="text-xs text-white/40 uppercase tracking-wider font-medium">Люди, которых вы можете знать</p>
              {RECOMMENDED.map(({ user, mutual }) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="story-ring"><div className="bg-[var(--fn-bg)] p-[2px] rounded-full"><Avatar className="w-11 h-11"><AvatarImage src={user.avatar} /><AvatarFallback>{user.name[0]}</AvatarFallback></Avatar></div></div>
                  <div className="flex-1 min-w-0"><p className="font-semibold text-white text-sm">{user.name}</p><p className="text-white/40 text-xs">{mutual} общих</p></div>
                  <button onClick={() => handleFollow(user.id)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${following.includes(user.id) ? "bg-white/10 text-white/60 hover:bg-red-500/20 hover:text-red-400" : "fn-gradient text-white hover:opacity-90 fn-glow"}`}>
                    {following.includes(user.id) ? "Подписан" : "Подписаться"}
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/40 uppercase tracking-wider font-medium px-1">Популярные посты</p>
            {[...posts].sort((a,b) => b.likes - a.likes).slice(0,3).map(post => (
              <div key={post.id} className="fn-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-8 h-8"><AvatarImage src={post.user.avatar} /><AvatarFallback>{post.user.name[0]}</AvatarFallback></Avatar>
                  <div><p className="text-sm font-medium text-white">{post.user.name}</p><p className="text-xs text-white/30">{post.user.handle}</p></div>
                  <div className="ml-auto flex items-center gap-1 text-[var(--fn-pink)] text-sm font-semibold">
                    <Icon name="Heart" size={14} className="fill-[var(--fn-pink)] text-[var(--fn-pink)]" />{post.likes.toLocaleString()}
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
                  <button className="p-2 rounded-xl hover:bg-white/8 text-white/40 hover:text-[var(--fn-teal)] transition-all"><Icon name="PenSquare" size={20} /></button>
                </div>
                <div className="relative mb-4">
                  <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <Input placeholder="Поиск сообщений..." className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pl-10 rounded-xl h-10 text-sm" />
                </div>
                {MESSAGES.map(msg => (
                  <button key={msg.id} onClick={() => setActiveChat(msg.id)} className="fn-card p-4 flex items-center gap-3 w-full text-left hover:border-white/15 transition-all">
                    <div className="relative">
                      <Avatar className="w-12 h-12"><AvatarImage src={msg.user.avatar} /><AvatarFallback>{msg.user.name[0]}</AvatarFallback></Avatar>
                      {msg.unread > 0 && <span className="absolute -top-1 -right-1 bg-[var(--fn-teal)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{msg.unread}</span>}
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
                  <button onClick={() => setActiveChat(null)} className="p-2 rounded-xl hover:bg-white/8 text-white/50 hover:text-white"><Icon name="ArrowLeft" size={20} /></button>
                  {(() => { const msg = MESSAGES.find(m => m.id === activeChat)!; return (<><Avatar className="w-10 h-10"><AvatarImage src={msg.user.avatar}/><AvatarFallback>{msg.user.name[0]}</AvatarFallback></Avatar><div><p className="font-semibold text-white text-sm">{msg.user.name}</p><p className="text-xs text-[var(--fn-teal)]">онлайн</p></div></>); })()}
                </div>
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto pb-4">
                  {[{text:"Привет! Видел твой новый пост — огонь 🔥",mine:false,time:"10:20"},{text:"Спасибо! Долго работал над ним)",mine:true,time:"10:22"},{text:"Слушай, а ты планируешь что-то новое?",mine:false,time:"10:23"},{text:"Да! Скоро анонс, следи за лентой 👀",mine:true,time:"10:25"}].map((m,i) => (
                    <div key={i} className={`flex ${m.mine?"justify-end":"justify-start"}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${m.mine?"fn-gradient text-white rounded-br-sm":"bg-white/8 text-white/80 rounded-bl-sm"}`}>
                        {m.text}<p className={`text-xs mt-1 ${m.mine?"text-white/60":"text-white/30"}`}>{m.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-auto">
                  <Input value={messageInput} onChange={e => setMessageInput(e.target.value)} placeholder="Написать сообщение..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                    onKeyDown={e => e.key === "Enter" && setMessageInput("")} />
                  <button onClick={() => setMessageInput("")} className="fn-gradient w-11 h-11 rounded-xl flex items-center justify-center fn-glow hover:opacity-90">
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
              <button className="text-[var(--fn-teal)] text-sm hover:opacity-70 transition-opacity">Прочитать все</button>
            </div>
            {NOTIFICATIONS.map((notif, idx) => (
              <div key={notif.id} className={`fn-card p-4 flex items-center gap-3 transition-all animate-fade-up ${!notif.read ? "border-[var(--fn-teal)]/20" : ""}`} style={{ animationDelay: `${idx*0.05}s` }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!notif.read ? "bg-[rgba(13,204,177,0.12)]" : "bg-white/5"}`}>
                  <Icon name={notif.icon} size={18} className={notif.color} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${!notif.read ? "text-white font-medium" : "text-white/60"}`}>{notif.text}</p>
                  <p className="text-xs text-white/30 mt-0.5">{notif.time} назад</p>
                </div>
                {!notif.read && <div className="w-2 h-2 rounded-full bg-[var(--fn-teal)] flex-shrink-0 notification-dot" />}
              </div>
            ))}
          </div>
        )}

        {/* PROFILE */}
        {activeTab === "profile" && (
          <div className="animate-fade-up">
            <div className="fn-card overflow-hidden mb-4">
              {/* Cover — кликабельная */}
              <div className="h-40 relative group cursor-pointer" onClick={() => coverFileRef.current?.click()}>
                {coverImage
                  ? <img src={coverImage} className="absolute inset-0 w-full h-full object-cover" alt="cover" />
                  : <div className="absolute inset-0" style={{ background: coverGradient }} />
                }
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-2">
                    <div className="bg-black/50 rounded-xl px-4 py-2 flex items-center gap-2 text-white">
                      <Icon name="Camera" size={16} />
                      <span className="text-sm font-medium">Изменить шапку</span>
                    </div>
                  </div>
                </div>
                {/* Gradient presets */}
                <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {["linear-gradient(135deg,#0DCCB1,#1E8FFF)","linear-gradient(135deg,#FF6B1A,#FF2D78)","linear-gradient(135deg,#8B2FFF,#EC4899)","linear-gradient(135deg,#0FE086,#0DCCB1)","linear-gradient(135deg,#F7971E,#FFD200)"].map((g, i) => (
                    <button key={i} onClick={e => { e.stopPropagation(); setCoverImage(null); setCoverGradient(g); }}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${coverGradient === g && !coverImage ? "border-white scale-110" : "border-white/40 hover:border-white"}`}
                      style={{ background: g }} />
                  ))}
                </div>
              </div>
              <input ref={coverFileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />

              <div className="px-5 pb-5">
                <div className="flex items-end justify-between -mt-10 mb-4">
                  <div className="story-ring cursor-pointer" onClick={() => { setDraftAvatar(myAvatar); setAvatarTab("face"); openModal("avatar"); }}>
                    <div className="bg-[var(--fn-surface)] p-1 rounded-full">
                      <MyAvatarEl size={80} />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-12">
                    <button onClick={() => { setDraftAvatar(myAvatar); setAvatarTab("face"); openModal("avatar"); }}
                      className="fn-gradient text-white text-xs font-semibold px-3 py-2 rounded-xl hover:opacity-90 fn-glow flex items-center gap-1.5">
                      <Icon name="Palette" size={14} />Аватар
                    </button>
                    <button onClick={() => { setDraftProfile(profile); openModal("editProfile"); }}
                      className="fn-glass text-white text-xs font-medium px-4 py-2 rounded-xl hover:border-white/20 flex items-center gap-1.5">
                      <Icon name="Pencil" size={14} />Редактировать
                    </button>
                  </div>
                </div>
                <h1 className="text-xl font-bold text-white">{profile.name}</h1>
                <p className="text-white/40 text-sm">{profile.handle}</p>
                <p className="text-white/70 text-sm mt-2">{profile.bio}</p>
                <div className="flex gap-3 mt-2 flex-wrap">
                  {profile.city && <span className="flex items-center gap-1 text-xs text-white/40"><Icon name="MapPin" size={12} />{profile.city}</span>}
                  {profile.website && <span className="flex items-center gap-1 text-xs text-[var(--fn-teal)]"><Icon name="Link" size={12} />{profile.website}</span>}
                </div>
                <div className="flex gap-6 mt-4">
                  {[{ label: "Постов", value: posts.filter(p => p.user.id === 1).length }, { label: "Подписчиков", value: "4 820" }, { label: "Подписок", value: USERS_DATA[0].following }].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <p className="font-bold text-white text-lg">{value}</p>
                      <p className="text-white/40 text-xs">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="fn-card p-4">
              <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-4">Публикации</p>
              <div className="grid grid-cols-3 gap-2">
                {[POST_IMG, FOX_LOGO, AVATAR_ME, POST_IMG, FOX_LOGO, AVATAR_ME].map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative">
                    <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-white text-sm font-semibold">
                        <Icon name="Heart" size={14} className="fill-white text-white" />{[342,89,1203,187,45,230][i]}
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
        <div className="fn-card p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-3">В тренде</p>
          <div className="space-y-3">
            {["#ФоксНет","#Разработка2026","#АртТренд","#МузыкаНедели"].map((tag, i) => (
              <div key={tag} className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-[var(--fn-teal)] transition-all">{tag}</p>
                  <p className="text-xs text-white/30">{[12,8,6,4][i]}K постов</p>
                </div>
                <span className="text-white/20 text-sm font-bold">#{i+1}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="fn-card p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-3">Подписаться</p>
          <div className="space-y-3">
            {RECOMMENDED.map(({ user }) => (
              <div key={user.id} className="flex items-center gap-3">
                <Avatar className="w-9 h-9"><AvatarImage src={user.avatar} /><AvatarFallback>{user.name[0]}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-white/30 truncate">{user.handle}</p>
                </div>
                <button onClick={() => handleFollow(user.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${following.includes(user.id) ? "text-white/40 bg-white/5" : "text-[var(--fn-teal)] bg-[rgba(13,204,177,0.1)] hover:bg-[rgba(13,204,177,0.2)]"}`}>
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