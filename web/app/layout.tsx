import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "claude-statusline — the Claude Code statusline, configurable",
  description:
    "A configurable, themeable, provider-pluggable statusline for the Claude Code TUI. Open source (MIT), zero dependencies, install in 30 seconds.",
  metadataBase: new URL("https://claude-statusline.vercel.app"),
  openGraph: {
    title: "claude-statusline",
    description:
      "A configurable, themeable, provider-pluggable statusline for Claude Code.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
