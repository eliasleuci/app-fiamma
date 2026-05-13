"use client";

import { BookingWizard } from "@/components/booking/BookingWizard";
import { FAQSection } from "@/components/public/FAQSection";
import { GallerySection } from "@/components/public/GallerySection";
import { TeamSection } from "@/components/public/TeamSection";
import { ReviewsSection } from '@/components/public/ReviewsSection';
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export default function Home() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen md:flex">

      {/* LEFT COLUMN: Hero Image (Desktop Fixed, Mobile Top) */}
      <div className="w-full md:w-1/2 md:h-screen md:fixed left-0 top-0 bg-[#F1EFEC] flex flex-col justify-center items-center p-8 md:p-12 z-10 relative overflow-hidden transition-colors duration-700 shadow-sm">
        {/* Background Watermark - Photographic Cinematic Style */}
        <div className="absolute inset-0">
          <img
            src="/branding/hero-luxury.png"
            alt="Fiamma Maniscalco"
            className="w-full h-full object-cover"
          />
          {/* Subtle overlay to soften the image and enhance the branding text */}
          <div className="absolute inset-0 bg-white/25"></div>
        </div>

        <div className="absolute top-8 right-8 z-20 md:fixed md:top-8 md:right-auto md:left-8">
          <LanguageSwitcher />
        </div>

        {/* PERFECTLY CENTERED LUXURY BRANDING */}
        <div className="relative z-10 text-center flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-1000">
          <div className="space-y-4">
            <div className="mb-2">
               <span className="font-serif text-5xl md:text-6xl italic text-[#4A362C] lowercase block mb-[-25px] ml-[-60px] opacity-100 drop-shadow-sm">
                fm
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-[#4A362C] uppercase leading-none drop-shadow-sm border-t border-[#4A362C]/30 pt-4">
              Fiamma Maniscalco
            </h1>
            <p className="text-[#5C4538] font-medium text-xs md:text-sm tracking-[0.4em] uppercase pt-2">
              Cosmetología y Cosmiatría
            </p>
          </div>
          
          <div className="absolute bottom-[-150px] left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-[0.6em] text-[#5C4538] uppercase opacity-90 whitespace-nowrap">
            {t('common.cordoba')} • {t('common.argentina')}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Minimal Luxury Interface (52% width) */}
      <div className="w-full md:w-[52%] md:ml-auto bg-[#fdfdfc] min-h-screen">
        <div className="px-6 py-16 md:p-24 max-w-2xl mx-auto space-y-24">

          {/* Top Label */}
          <div className="text-center md:text-left mb-8">
            <h2 className="font-serif text-[11px] font-bold tracking-[0.5em] text-[#C5A02E] uppercase">
              {t('common.booking')}
            </h2>
          </div>

          {/* Booking Section */}
          <section id="book" className="relative">
            <BookingWizard />
          </section>

          {/* Team - Minimalist */}
          <TeamSection />

          {/* Gallery */}
          <GallerySection />

          {/* Reviews Section with warm background */}
          <div className="-mx-6 md:-mx-24 px-6 md:px-24 bg-[#f7f4ef] py-24">
            <ReviewsSection />
          </div>

          {/* FAQs */}
          <FAQSection />

          <footer className="text-center text-[10px] text-stone-300 py-12 uppercase tracking-[0.4em] border-t border-stone-100/60">
            <div>Fiamma Maniscalco © {new Date().getFullYear()}</div>
            <div className="mt-6 flex items-center justify-center gap-6 lowercase tracking-normal text-stone-400">
              <a href="/staff" className="hover:text-[#C5A02E] transition-colors">{t('common.staff_access')}</a>
              <span className="w-1 h-1 bg-stone-200 rounded-full"></span>
              <a href="/admin" className="hover:text-[#C5A02E] transition-colors font-medium">{t('common.admin_panel')}</a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
