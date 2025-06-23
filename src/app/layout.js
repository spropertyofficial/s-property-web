import Providers from "@/components/common/ProgressBarProvider";
import "@/styles/globals.css";
import { Provider } from "react-redux";
export const metadata = {
  title: "S Property",
  description: "Aplikasi Web S Property",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
