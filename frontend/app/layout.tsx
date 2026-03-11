import type { Metadata } from "next";
import "./globals.css";
import "@flaticon/flaticon-uicons/css/all/all.css";

export const metadata: Metadata = {
  title: "Klinik ERP",
  description: "Enterprise Resource Planning System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
