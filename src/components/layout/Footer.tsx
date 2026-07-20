import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="section pt-16 pb-0 relative overflow-hidden">
      <div className="container-page relative z-10">
        <div className="gradient-divider mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div>
            <Image
              src="/hirenum-logo.png"
              alt="Hirenum"
              width={196}
              height={40}
              priority
              className="mb-3"
              style={{ height: "28px", width: "auto" }}
            />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Internship &amp; hiring portal.
            </p>
          </div>
          <div>
            <div className="eyebrow mb-3">Careers</div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#roles" className="hover-underline">
                  Team &amp; roles
                </Link>
              </li>
              <li>
                <Link href="/apply" className="hover-underline">
                  Apply
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="hover-underline">
                  Onboarding
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-3">Company</div>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://hirenum.com" className="hover-underline">
                  Main site
                </a>
              </li>
              <li>
                <a href="mailto:hello@hirenum.com" className="hover-underline">
                  hello@hirenum.com
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-3">Socials</div>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.linkedin.com/company/hirenum/"
                  className="hover-underline"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/hirenum.us/"
                  className="hover-underline"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="footer-wordmark pb-6 relative z-0">
        HIRENUM
      </div>
    </footer>
  );
}
