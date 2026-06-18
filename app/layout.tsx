import type { Metadata } from "next";
import SessionProvider from "./components/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResumeFlow Labs",
  description: "Build professional resumes with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="font-sans h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
