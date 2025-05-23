import "@/styles/globals.css";

export const metadata = {
  title: "S Property",
  description: "Aplikasi Web S Property",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}