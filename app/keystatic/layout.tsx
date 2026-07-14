// A separate root layout for the Keystatic admin UI. It intentionally does
// NOT import ../globals.css (Tailwind preflight + our own CSS reset), since
// those global resets were breaking @keystar/ui's layout — the admin UI
// renders nothing visible when it inherits the site's root layout.
export default function KeystaticLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
