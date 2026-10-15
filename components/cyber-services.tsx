'use client';

import React from 'react';
import type { IconType } from 'react-icons';
import {
  FaPrint,
  FaCopy,
  FaPalette,
  FaLayerGroup,
  FaFileLines,
  FaWifi,
  FaCamera,
  FaFilePdf,
  FaWhatsapp,
  FaPhone,
} from 'react-icons/fa6';

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '254728619730';
const PHONE = process.env.NEXT_PUBLIC_PHONE_NUMBER || '+254728619730';

const waLink = (text: string) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

interface Service {
  title: string;
  desc: string;
  icon: IconType;
  from: string;
  to: string;
  tag?: string;
}

const SERVICES: Service[] = [
  { title: 'Photocopying', desc: 'Fast black-and-white and colour copies, single pages or bulk.', icon: FaCopy, from: '#00C2D1', to: '#3A86FF' },
  { title: 'Printing', desc: 'Documents, CVs, assignments and posters printed sharp and clean.', icon: FaPrint, from: '#3A86FF', to: '#7B2CBF', tag: 'Popular' },
  { title: 'Branding', desc: 'T-shirts, mugs, caps, banners and business cards with your logo.', icon: FaPalette, from: '#7B2CBF', to: '#FF3D9A', tag: 'Custom' },
  { title: 'Scanning & PDF', desc: 'Scan documents and photos, convert to PDF, send to email.', icon: FaFilePdf, from: '#FF3D9A', to: '#FFB020' },
  { title: 'Lamination & Binding', desc: 'Protect and present IDs, certificates, reports and proposals.', icon: FaLayerGroup, from: '#FFB020', to: '#FF3D9A' },
  { title: 'Typing & Document Prep', desc: 'Letters, CVs, forms and spreadsheets typed and formatted for you.', icon: FaFileLines, from: '#00C2D1', to: '#7B2CBF' },
  { title: 'Passport Photos', desc: 'Quick passport-size photos for applications and IDs.', icon: FaCamera, from: '#3DFFA2', to: '#00C2D1' },
  { title: 'Internet Browsing', desc: 'Fast connected workstations for online applications and research.', icon: FaWifi, from: '#3A86FF', to: '#00C2D1' },
];

function ServiceCard({ s, hidden }: { s: Service; hidden?: boolean }) {
  const Icon = s.icon;
  return (
    // 📐 Bigger, fluid card sizes: roomy on phones (about 1.5 cards visible) and growing on larger screens
    <article
      aria-hidden={hidden || undefined}
      className="group relative flex w-[210px] shrink-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/10 hover:shadow-xl hover:shadow-black/30 sm:w-[240px] sm:p-4 md:w-[270px] md:p-5 lg:w-[300px] xl:w-[330px] 2xl:w-[360px]"
    >
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${s.from}, ${s.to})` }} />
      {/* soft colour glow in the corner, matches each service */}
      <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-25 blur-2xl transition-opacity duration-300 group-hover:opacity-50" style={{ background: s.to }} />

      <div className="relative mb-3 flex items-start justify-between sm:mb-4">
        <div
          className="animate-float flex h-10 w-10 items-center justify-center rounded-xl text-lg text-white shadow-lg sm:h-12 sm:w-12 sm:text-xl md:h-14 md:w-14 md:text-2xl"
          style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}
        >
          <Icon />
        </div>
        {s.tag && (
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/90 sm:text-xs">{s.tag}</span>
        )}
      </div>

      <h3 className="relative text-sm font-semibold text-white sm:text-base md:text-lg">{s.title}</h3>
      <p className="relative mt-1 min-h-[3.5rem] flex-1 text-xs leading-snug text-gray-400 sm:min-h-[4rem] sm:text-sm md:min-h-[4.5rem]">{s.desc}</p>

      <a
        href={waLink(`Hi COLLTECH, I would like to order: ${s.title}`)}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={hidden ? -1 : 0}
        className="relative mt-3 inline-flex items-center justify-center gap-1.5 rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold text-white transition hover:border-transparent hover:bg-gradient-to-r hover:from-[#00C2D1] hover:to-[#7B2CBF] sm:mt-4 sm:py-2 sm:text-sm"
      >
        <FaWhatsapp /> Order
      </a>
    </article>
  );
}

export default function CyberServices() {
  return (
    <section id="cyber-services" className="scroll-mt-28 mt-6 sm:mt-8 md:mt-10">
      <div className="mx-auto w-full px-2 sm:px-3 md:px-4">
        <div className="mb-3 text-center sm:mb-4 md:mb-5">
          <h2 className="text-base font-bold tracking-tight text-white sm:text-lg md:text-xl lg:text-2xl">
            Cyber & Print Services
          </h2>
          <p className="mx-auto mt-1 max-w-xl text-[11px] text-gray-400 sm:text-xs md:text-sm">
            Photocopying, printing, branding and more, done in-house at COLLTECH.
          </p>
          <span className="mx-auto mt-1.5 block h-0.5 w-12 rounded-full bg-gradient-to-r from-[#00C2D1] via-[#3A86FF] to-[#FF3D9A] sm:mt-2 sm:h-1 sm:w-16" />
        </div>
      </div>

      {/* Auto-scrolling row (cards are bigger now, so the loop is a little slower to stay easy to read) */}
      <div
        className="marquee-viewport py-1.5 sm:py-2"
        style={{ maskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)' }}
      >
        <div className="marquee-track" style={{ '--marquee-duration': '80s', '--marquee-gap': '0.75rem' } as React.CSSProperties}>
          {SERVICES.map((s) => <ServiceCard key={s.title} s={s} />)}
          {SERVICES.map((s) => <ServiceCard key={`${s.title}-dup`} s={s} hidden />)}
        </div>
      </div>

      {/* Call to action */}
      <div className="mx-auto mt-4 w-full px-2 sm:mt-5 sm:px-3 md:mt-6 md:px-4">
        <div className="animate-gradient-pan flex flex-col items-center justify-between gap-2 rounded-lg bg-gradient-to-r from-[#00C2D1] via-[#7B2CBF] to-[#FF3D9A] p-3 text-center shadow-lg shadow-[#7B2CBF]/20 sm:gap-3 sm:rounded-xl sm:p-4 md:flex-row md:text-left">
          <div>
            <h3 className="text-sm font-bold text-white sm:text-base md:text-lg">Need something printed or branded?</h3>
            <p className="mt-0.5 text-[11px] text-white/85 sm:text-xs md:text-sm">Send your file on WhatsApp, or walk in. We confirm the price before we start.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <a
              href={waLink('Hi COLLTECH, I need a quote for printing/branding.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-semibold text-gray-900 transition hover:scale-105 sm:px-4 sm:py-2 sm:text-xs md:text-sm"
            >
              <FaWhatsapp className="text-green-600" /> Get a quote
            </a>
            <a
              href={`tel:${PHONE}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/60 px-3.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/15 sm:px-4 sm:py-2 sm:text-xs md:text-sm"
            >
              <FaPhone /> Call us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}