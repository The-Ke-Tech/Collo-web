'use client';

import React, { useEffect, useState } from 'react';
import { FaGamepad, FaWhatsapp, FaFutbol, FaTrophy, FaClock } from 'react-icons/fa6';

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '254728619730';
const waLink = (text: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

export type StationStatus = 'available' | 'in-use' | 'reserved';

export interface Station {
  id: string;
  name: string;
  console: string;
  game: string;
  status: StationStatus;
}

const DEFAULT_STATIONS: Station[] = [
  { id: '1', name: 'Station 1', console: 'PS5', game: 'EA SPORTS FC (FIFA)', status: 'available' },
  { id: '2', name: 'Station 2', console: 'PS5', game: 'EA SPORTS FC (FIFA)', status: 'in-use' },
  { id: '3', name: 'Station 3', console: 'PS5', game: 'EA SPORTS FC (FIFA)', status: 'available' },
  { id: '4', name: 'Station 4', console: 'PS5', game: 'Mortal Kombat', status: 'reserved' },
  { id: '5', name: 'Station 5', console: 'PS5', game: 'Tekken', status: 'in-use' },
  { id: '6', name: 'Station 6', console: 'PS5', game: 'Call of Duty', status: 'available' },
];

const GAMES = [
  { title: 'EA SPORTS FC (FIFA)', genre: 'Football', from: '#3DFFA2', to: '#00C2D1' },
  { title: 'Call of Duty', genre: 'Shooter', from: '#FF3D9A', to: '#7B2CBF' },
  { title: 'GTA V', genre: 'Open world', from: '#FFB020', to: '#FF3D9A' },
  { title: 'Tekken', genre: 'Fighting', from: '#3A86FF', to: '#7B2CBF' },
  { title: 'Mortal Kombat', genre: 'Fighting', from: '#FF3D9A', to: '#FFB020' },
  { title: 'NBA 2K', genre: 'Basketball', from: '#00C2D1', to: '#3A86FF' },
  { title: 'UFC', genre: 'Combat sports', from: '#7B2CBF', to: '#FF3D9A' },
  { title: 'Racing & more', genre: 'Ask at the counter', from: '#3A86FF', to: '#3DFFA2' },
];

const STATUS: Record<StationStatus, { label: string; color: string }> = {
  available: { label: 'Free now', color: '#3DFFA2' },
  'in-use': { label: 'In play', color: '#FF3D9A' },
  reserved: { label: 'Reserved', color: '#FFB020' },
};

interface GamingZoneProps {
  endpoint?: string;
}

export default function GamingZone({ endpoint = '/api/gaming/availability' }: GamingZoneProps) {
  const [stations, setStations] = useState<Station[]>(DEFAULT_STATIONS);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(endpoint, { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        const list = Array.isArray(json) ? json : json?.data;
        if (!cancelled && Array.isArray(list) && list.length) setStations(list);
      } catch {
        /* keep current data */
      }
    };
    load();
    const id = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [endpoint]);

  const free = stations.filter((s) => s.status === 'available').length;

  return (
    <section id="gaming-zone" className="scroll-mt-28 mt-6 sm:mt-8 md:mt-10">
      <div className="mx-auto w-full px-2 sm:px-3 md:px-4">
        <div
          className="relative overflow-hidden rounded-xl border border-white/10 p-3 shadow-xl shadow-black/30 sm:rounded-2xl sm:p-4 md:p-5 lg:p-6"
          style={{
            background:
              'radial-gradient(700px 320px at 0% 0%, rgba(255,61,154,0.22), transparent 60%), radial-gradient(600px 320px at 100% 100%, rgba(0,194,209,0.20), transparent 60%), linear-gradient(135deg, #1a1033, #0d1220)',
          }}
        >
          <div className="grid gap-4 lg:grid-cols-5 lg:gap-6">
            {/* Hero / pitch */}
            <div className="lg:col-span-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[10px] font-medium text-white sm:text-xs">
                <span className="status-dot h-1.5 w-1.5 rounded-full" style={{ background: '#3DFFA2', color: '#3DFFA2' }} />
                Gaming lounge now open
              </span>

              <h2 className="mt-3 text-lg font-extrabold leading-tight tracking-tight text-white sm:text-xl md:text-2xl lg:text-3xl">
                Play the latest FIFA on <span className="text-gradient-brand">PS5</span>
              </h2>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-gray-300 sm:text-sm md:text-[15px]">
                Challenge your friends, run a tournament or just play for fun. Check which stations are free
                before you come.
              </p>

              <div className="mt-4 grid grid-cols-3 gap-1.5 sm:gap-2">
                <div className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-center sm:p-2.5">
                  <FaGamepad className="animate-float mx-auto mb-0.5 text-base text-[#00C2D1] sm:text-lg" />
                  <p className="text-base font-bold text-white sm:text-xl">
                    {free}<span className="text-xs text-gray-400">/{stations.length}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 sm:text-xs">Stations free</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-center sm:p-2.5">
                  <FaFutbol className="mx-auto mb-0.5 text-base text-[#3DFFA2] sm:text-lg" />
                  <p className="text-[10px] font-bold text-white sm:text-xs">FIFA</p>
                  <p className="text-[10px] text-gray-400 sm:text-xs">Latest edition</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-center sm:p-2.5">
                  <FaTrophy className="mx-auto mb-0.5 text-base text-[#FFB020] sm:text-lg" />
                  <p className="text-[10px] font-bold text-white sm:text-xs">Tournaments</p>
                  <p className="text-[10px] text-gray-400 sm:text-xs">Ask for dates</p>
                </div>
              </div>

              <a
                href={waLink('Hi COLLTECH, I would like to reserve a PS5 station.')}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF3D9A] to-[#7B2CBF] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-[#FF3D9A]/30 transition hover:scale-105 sm:text-sm"
              >
                <FaWhatsapp /> Reserve a station
              </a>
            </div>

            {/* Live availability board */}
            <div className="lg:col-span-3">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white sm:text-base">Availability</h3>
                <span className="flex items-center gap-1 text-[10px] text-gray-400 sm:text-xs">
                  <FaClock /> Updates every 30s
                </span>
              </div>

              <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2">
                {stations.map((s) => {
                  const st = STATUS[s.status] ?? STATUS.available;
                  return (
                    <li
                      key={s.id}
                      className="rounded-lg border bg-white/5 p-2 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/10 sm:p-2.5"
                      style={{ borderColor: `${st.color}55` }}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold text-white sm:text-xs">{s.name}</p>
                        <span className="text-[9px] text-gray-400 sm:text-[10px]">{s.console}</span>
                      </div>
                      <p className="mt-0.5 truncate text-[9px] text-gray-400 sm:text-[10px]">{s.game}</p>
                      <p className="mt-1.5 flex items-center gap-1 text-[10px] font-medium sm:text-xs" style={{ color: st.color }}>
                        <span className="status-dot h-1.5 w-1.5 rounded-full" style={{ background: st.color, color: st.color }} />
                        {st.label}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Games ticker — compact modern cards */}
          <div
            className="marquee-viewport marquee-reverse mt-5 sm:mt-6"
            style={{ maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)' }}
          >
            <div className="marquee-track" style={{ '--marquee-duration': '45s', '--marquee-gap': '0.5rem' } as React.CSSProperties}>
              {[0, 1].map((copy) =>
                GAMES.map((g) => (
                  <div
                    key={`${g.title}-${copy}`}
                    aria-hidden={copy === 1 || undefined}
                    className="flex w-32 shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 p-1.5 sm:w-36 sm:gap-2 sm:p-2 md:w-40"
                  >
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs text-white sm:h-8 sm:w-8 sm:text-sm"
                      style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                    >
                      <FaGamepad />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-semibold text-white sm:text-xs">{g.title}</p>
                      <p className="truncate text-[9px] text-gray-400 sm:text-[10px]">{g.genre}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}