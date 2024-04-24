import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


import { Young_Serif } from 'next/font/google'

const youngSerif = Young_Serif({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "tube uni",
  description: "do something useful with your commute, dummy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
      </head>
      <body className={youngSerif.className}>{children}</body>
    </html>
  );
}
