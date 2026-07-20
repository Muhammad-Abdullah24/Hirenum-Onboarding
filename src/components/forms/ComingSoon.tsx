import Link from "next/link";
import { Clock } from "lucide-react";

export function ComingSoon() {
  return (
    <div className="coming-soon">
      <span className="coming-soon-icon">
        <Clock size={22} />
      </span>
      <h2 className="coming-soon-title">Applications aren&apos;t open yet</h2>
      <p className="coming-soon-copy">
        We&apos;re not accepting new applications right now. Check back soon
        &mdash; we&apos;ll be opening roles again shortly.
      </p>
      <Link href="/" className="btn btn-ghost">
        <span>Back to home</span>
      </Link>
    </div>
  );
}
