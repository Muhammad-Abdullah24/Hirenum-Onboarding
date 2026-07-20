export function AuroraBackground() {
  return (
    <div className="aurora-bg-layer" aria-hidden="true">
      <div
        className="aurora-blob aurora-blob-teal"
        style={{ top: "-220px", left: "-160px", animationDuration: "22s" }}
      />
      <div
        className="aurora-blob aurora-blob-magenta"
        style={{ top: "-100px", right: "-200px", animationDuration: "26s", animationDelay: "-8s" }}
      />
      <div
        className="aurora-blob aurora-blob-violet"
        style={{ bottom: "-240px", left: "20%", animationDuration: "30s", animationDelay: "-4s" }}
      />
      <div
        className="aurora-blob aurora-blob-teal"
        style={{
          bottom: "-160px",
          right: "-120px",
          width: "420px",
          height: "420px",
          opacity: 0.35,
          animationDuration: "24s",
          animationDelay: "-14s",
        }}
      />
      <div className="aurora-grain" />
    </div>
  );
}
