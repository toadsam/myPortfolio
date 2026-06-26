import type {Metadata} from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "정재훈 | AI Portfolio Village",
  description: "A low-poly interactive 3D portfolio village built with Next.js, React Three Fiber, Drei, Framer Motion, and Tailwind CSS."
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
