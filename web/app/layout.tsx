import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "minimax-statusline — MiniMax CLI 底部状态条，可配置可主题化",
  description:
    "为 MiniMax CLI / Coding Plan 优化的可配置、可主题化、提供方可插拔的状态条。开源（MIT），零依赖，30 秒装好。",
  metadataBase: new URL("https://web-zeta-sage-59.vercel.app"),
  openGraph: {
    title: "minimax-statusline",
    description: "为 MiniMax CLI 做的可配置、可主题化、提供方可插拔的底部状态条。",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "minimax-statusline",
    description: "为 MiniMax CLI 做的可配置、可主题化、提供方可插拔的底部状态条。",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
