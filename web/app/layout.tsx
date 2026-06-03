import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "minimax-statusline — the MiniMax statusline, configurable",
  description:
    "A configurable, themeable, provider-pluggable statusline for the MiniMax CLI. Open source (MIT), zero dependencies, install in 30 seconds.",
  metadataBase: new URL("https://minimax-statusline.vercel.app"),
  openGraph: {
    title: "minimax-statusline",
    description:
      "A configurable, themeable, provider-pluggable statusline for MiniMax.",
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
