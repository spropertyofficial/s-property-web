import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ReduxProvider from "@/components/providers/ReduxProvider";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  icons: {
    icon: "/favicon.ico",
  },
  title: "S-Property",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "S-Property",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#4a90e2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function SiteLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <Header />
          <AuthProvider>
            {children}
            <ServiceWorkerRegistration />
          </AuthProvider>
          <Footer />
          <Analytics />
        </ReduxProvider>
      </body>
    </html>
  );
}
