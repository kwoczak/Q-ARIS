import type { Metadata } from "next";
import { Inter, Roboto, Playfair_Display, Merriweather, Oswald } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const roboto = Roboto({ weight: ['400', '700'], subsets: ["latin"], variable: '--font-roboto' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });
const merriweather = Merriweather({ weight: ['300', '400', '700'], subsets: ["latin"], variable: '--font-merriweather' });
const oswald = Oswald({ subsets: ["latin"], variable: '--font-oswald' });

export const metadata: Metadata = {
  title: "Museum Storytelling App",
  description: "WebAR Interactive Guide",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js" async></script>
      </head>
      <body className={`${inter.variable} ${roboto.variable} ${playfair.variable} ${merriweather.variable} ${oswald.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
