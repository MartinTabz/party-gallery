import "@styles/globals.css";

export const metadata = {
  title: "Narozeninová oslava",
  description: "Webová aplikace pro vkládání vzkazů. Vytvořil Martin Šíl.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
