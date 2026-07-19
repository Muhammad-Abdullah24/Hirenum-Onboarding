import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProviderWrapper } from "@/components/layout/ThemeProviderWrapper";

const heading = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["600", "700", "800"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Hirenum Careers | Apply for an Internship",
  description: "Apply for an internship or role at Hirenum.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${heading.variable} ${body.variable} theme-transition`}>
        <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
      </body>
    </html>
  );
}
