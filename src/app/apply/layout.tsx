export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Runs before hydration to force dark class pre-paint -- Nav's
          forceDarkTheme prop sets it too, but only in a useEffect (post-mount),
          which flashes the page's default (light) theme first on every visitor
          whose stored preference isn't already dark. */}
      <script
        dangerouslySetInnerHTML={{ __html: "document.documentElement.className = 'dark'" }}
      />
      {children}
    </>
  );
}
