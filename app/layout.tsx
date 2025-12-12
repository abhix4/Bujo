import type { Metadata } from "next";
import { Ubuntu_Sans } from "next/font/google";
import "./globals.css";

const Ubuntu = Ubuntu_Sans({
  variable: "--font-ubuntu",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Component Assistant",
  description: "Built by Abhishek",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${Ubuntu.className} antialiased`}>{children}</body>
    </html>
  );
}
