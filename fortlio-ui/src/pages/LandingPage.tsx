// pages/LandingPage.tsx
import Navbar from "../components/landingPageComponents/Navbar";
import Hero from "../components/landingPageComponents/Hero";
import Features from "../components/landingPageComponents/Features";
import HowItWorks from "../components/landingPageComponents/HowItWorks";
import Testimonials from "../components/landingPageComponents/Testimonials";
import CTA from "../components/landingPageComponents/CTA";
import Footer from "../components/landingPageComponents/Footer";

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}