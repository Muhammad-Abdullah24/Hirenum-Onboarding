function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function hueFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

export function AdminAvatar({ name, size = 38 }: { name: string; size?: number }) {
  const hue = hueFor(name || "?");
  return (
    <span
      className="admin-avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `hsla(${hue}, 70%, 50%, 0.15)`,
        color: `hsl(${hue}, 65%, 42%)`,
      }}
    >
      {initials(name)}
    </span>
  );
}
