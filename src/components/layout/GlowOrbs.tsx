export function GlowOrbs() {
  return (
    <>
      <div
        className="glow-orb glow-orb-drift"
        style={{ top: "-200px", right: "-200px" }}
        aria-hidden="true"
      />
      <div
        className="glow-orb glow-orb-drift"
        style={{
          bottom: "-250px",
          left: "-150px",
          width: "500px",
          height: "500px",
          opacity: 0.4,
          animationDelay: "-6s",
        }}
        aria-hidden="true"
      />
    </>
  );
}
