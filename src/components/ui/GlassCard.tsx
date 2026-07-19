import { HTMLAttributes } from "react";

export function GlassCard({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`glass-card p-6 hover-lift hover-glow ${className}`} {...props}>
      {children}
    </div>
  );
}
