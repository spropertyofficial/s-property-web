
import CompanyValues from "./components/CompanyValues";
import VisionMission from "./components/VisionMission";
import TeamSection from "./components/TeamSection";
import Achievements from "./components/Achievements";
import Testimonials from "./components/Testimonials";
import AboutCTA from "./components/AboutCTA";
import AboutHero from "./components/AboutHero";

export const metadata = {
  title: 'Tentang S-Property | Agen Properti Terpercaya',
  description: 'Pelajari lebih lanjut tentang S-Property, visi misi kami, nilai-nilai perusahaan, dan tim yang berdedikasi untuk membantu Anda menemukan properti impian.',
};

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <VisionMission />
      <CompanyValues />
      <Testimonials />
      <AboutCTA />
    </main>
  );
}