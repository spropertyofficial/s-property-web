'use client'
import CompanyValues from "./components/CompanyValues";
import VisionMission from "./components/VisionMission";
import TeamSection from "./components/TeamSection";
import Achievements from "./components/Achievements";
import Testimonials from "./components/Testimonials";
import AboutCTA from "./components/AboutCTA";
import AboutHero from "./components/AboutHero";
import { useAuth } from "@/context/AuthContext";

export const metadata = {
  title: "Tentang S-Property | Agen Properti Terpercaya",
  description:
    "Pelajari lebih lanjut tentang S-Property, visi misi kami, nilai-nilai perusahaan, dan tim yang berdedikasi untuk membantu Anda menemukan properti impian.",
};

export default function AboutPage() {
  const { isAgent } = useAuth();
  return (
    <main>
      <AboutHero />
      <VisionMission />
      <CompanyValues />
      {isAgent() && <Testimonials />}
      <AboutCTA />
    </main>
  );
}
