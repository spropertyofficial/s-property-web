import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ReduxProvider from "@/components/providers/ReduxProvider";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  icons: {
    icon: "/favicon.ico",
  },
  title: "S-Property",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'S-Property',
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport = {
  themeColor: '#4a90e2',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <Header />
          {children}
          <ServiceWorkerRegistration />
          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}
