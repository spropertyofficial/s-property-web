import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/context/AuthContext";
import ReduxProvider from "@/components/providers/ReduxProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  icons: {
    icon: "/favicon.ico",
  },
  title: "Login - S-Property",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "S-Property Login",
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

export default function AuthLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gradient-to-br from-tosca-50 to-tosca-100">
              {children}
            </div>
          </AuthProvider>
          <Analytics />
        </ReduxProvider>
      </body>
    </html>
  );
}