import Navbar from "../components/Navbar";
import Hero from "./Hero/HeroSection";
import WhyUsSection from "./WhyUs/WhyUsSection";
// Section lain nanti di-import di sini, contoh:
// import Fitur from "../components/Fitur";

export default function LandingPage() {
  return (
    <div className="scroll-smooth font-sans">
      <Navbar />
      <main>
        <Hero />
        <WhyUsSection/>
        {/* <Fitur /> */}
        {/* <Tujuan /> */}
        {/* <Ringkasan /> */}
        {/* <Faq /> */}
      </main>
    </div>
  );
}