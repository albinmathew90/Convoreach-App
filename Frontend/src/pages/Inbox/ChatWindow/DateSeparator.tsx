interface Props {
  label: string;
}

export default function DateSeparator({ label }: Props) {
  return (
    <div className="flex items-center gap-3 py-2 px-4">
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap px-2 py-0.5 bg-gray-50 dark:bg-gray-800 rounded-full">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

export function getDateLabel(timestamp: number | null, createdAt: string): string {
  const date = timestamp ? new Date(timestamp * 1000) : new Date(createdAt);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - msgDate.getTime()) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: diffDays > 365 ? 'numeric' : undefined });
}
