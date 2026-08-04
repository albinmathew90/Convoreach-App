import { useState, useMemo } from 'react';

const EMOJI_CATEGORIES: { label: string; icon: string; emojis: string[] }[] = [
  { label: 'Smileys', icon: '😀', emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','😘','😗','😙','😚','😋','😛','😝','😜','🤪','😎','🤓','🧐','🤩','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','😈','👿','💀'] },
  { label: 'Gestures', icon: '👍', emojis: ['👍','👎','👌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👋','🤚','✋','🖐️','🖖','💪','🙏','🤝','👐','🙌','👏','🤲'] },
  { label: 'Hearts', icon: '❤️', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️'] },
  { label: 'Objects', icon: '📱', emojis: ['📱','💻','🖥️','⌨️','🖱️','📷','📸','📹','🎥','📞','☎️','📟','📠','📺','📻','🎵','🎶','🎤','🎧','📣','🔔','🔕','📢','📯','🔊','🔉','🔈','🔇'] },
  { label: 'Symbols', icon: '✅', emojis: ['✅','❌','❎','✔️','☑️','⭕','🔴','🔵','🟢','🟡','🟠','🟣','⚫','⚪','🔶','🔷','🔹','🔸','▪️','▫️','🔺','🔻','💠','🔘','🔲','🔳'] },
];

interface Props {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onSelect, onClose }: Props) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState('');

  const filteredEmojis = useMemo(() => {
    if (!search.trim()) return EMOJI_CATEGORIES[activeCategory]?.emojis ?? [];
    const lower = search.toLowerCase();
    return EMOJI_CATEGORIES.flatMap((c) =>
      c.emojis.filter((emoji) => emoji.includes(search) || c.label.toLowerCase().includes(lower)),
    ).slice(0, 40);
  }, [search, activeCategory]);

  return (
    <div className="absolute bottom-full mb-2 left-0 z-50 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-theme-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emoji..."
          className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
          autoFocus
        />
      </div>

      {/* Category tabs */}
      {!search && (
        <div className="flex px-2 gap-1 border-b border-gray-100 dark:border-gray-800">
          {EMOJI_CATEGORIES.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveCategory(i)}
              className={`p-1.5 text-base rounded-lg transition-colors ${
                activeCategory === i
                  ? 'bg-brand-50 dark:bg-brand-500/10'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title={cat.label}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div className="grid grid-cols-8 gap-0.5 p-2 h-36 overflow-y-auto custom-scrollbar">
        {filteredEmojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => { onSelect(emoji); onClose(); }}
            className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
