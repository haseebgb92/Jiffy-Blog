import "../styles/globals.css";
import React from "react";

export const metadata = {
  title: "shopify-ai-blogger",
  description: "Generate and schedule Shopify blog posts with AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}


