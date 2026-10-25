import Navbar from '../components/Navbar'
import Hero from '../0landingPage/Hero/HeroSection'
import FiturSection from '../0landingPage/Fitur/FiturSection'
import WhyUsSection from '../0landingPage/WhyUs/WhyUsSection'
import RingkasanSection from '../0landingPage/Ringkasan/RingkasanSection'
import FaqSection from '../0landingPage/Faq/FaqSection'
import CtaSection from '../0landingPage/Cta/CtaSection'
import Footer from '../components/landing/Footer'
import AiChatWidget from '../components/landing/AiChatWidget'

export default function LandingPage() {
  return (
    <div className="scroll-smooth font-sans bg-white selection:bg-[#BFE3DA] selection:text-[#0F5A6B]">
      <Navbar />
      <main>
        <Hero />
        <FiturSection />
        <WhyUsSection />
        <RingkasanSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
      <AiChatWidget />
      <div></div>
    </div>
  )
}
