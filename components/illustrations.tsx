'use client';

import React from 'react';

/**
 * Vector (SVG) illustrations: they stay sharp on every screen size and pixel density (HD / retina).
 * Brand colours: cyan #00C2D1, blue #3A86FF, purple #7B2CBF, pink #FF3D9A, amber #FFB020.
 */

export function NoConnectionIllustration({ className }: { className?: string }) {
  return (
<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 360" role="img" aria-label="No internet connection" focusable="false">
<defs>
<radialGradient id="nc-glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#7B2CBF" stopOpacity=".55"/><stop offset="60%" stopColor="#00C2D1" stopOpacity=".12"/><stop offset="100%" stopColor="#00C2D1" stopOpacity="0"/></radialGradient>
<linearGradient id="nc-wifi" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor="#00C2D1"/><stop offset="55%" stopColor="#3A86FF"/><stop offset="100%" stopColor="#7B2CBF"/></linearGradient>
<linearGradient id="nc-pink" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FF3D9A"/><stop offset="100%" stopColor="#FFB020"/></linearGradient>
<linearGradient id="nc-cloud" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#3A86FF" stopOpacity=".95"/><stop offset="100%" stopColor="#7B2CBF" stopOpacity=".95"/></linearGradient>
</defs>
<ellipse cx="280" cy="188" rx="262" ry="170" fill="url(#nc-glow)"/>
<circle cx="280" cy="188" r="140" fill="none" stroke="url(#nc-wifi)" strokeWidth="3" strokeOpacity=".55" strokeDasharray="3 9"/>
<circle cx="280" cy="188" r="120" fill="#121a3a" fillOpacity=".92" stroke="#fff" strokeOpacity=".1"/>
<g fill="none" stroke="url(#nc-wifi)" strokeWidth="16" strokeLinecap="round">
<path d="M254.5 206.5 A36 36 0 0 1 305.5 206.5"/>
<path d="M229.1 181.1 A72 72 0 0 1 330.9 181.1"/>
<path d="M203.6 155.6 A108 108 0 0 1 356.4 155.6"/>
</g>
<circle cx="280" cy="232" r="13" fill="url(#nc-wifi)"/>
<line x1="220" y1="134" x2="342" y2="252" stroke="#121a3a" strokeWidth="32" strokeLinecap="round"/>
<line x1="220" y1="134" x2="342" y2="252" stroke="url(#nc-pink)" strokeWidth="13" strokeLinecap="round"/>
<g transform="translate(398 96)"><circle r="30" fill="url(#nc-pink)"/><circle r="30" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="2"/><rect x="-3.5" y="-16" width="7" height="19" rx="3.5" fill="#fff"/><circle cy="12" r="4.2" fill="#fff"/></g>
<g transform="translate(86 78)"><path d="M30 60 a24 24 0 0 1 4 -47 a32 32 0 0 1 60 6 a22 22 0 0 1 2 41 z" fill="url(#nc-cloud)"/><path d="M48 28 l22 22 M70 28 l-22 22" stroke="#fff" strokeWidth="6" strokeLinecap="round"/></g>
<g transform="translate(400 270)">
<path d="M-34 0 C-70 0 -70 40 -120 40" fill="none" stroke="url(#nc-wifi)" strokeWidth="7" strokeLinecap="round"/>
<rect x="44" y="-18" width="46" height="36" rx="8" fill="#1d2440" stroke="#fff" strokeOpacity=".18"/>
<rect x="53" y="-9" width="6" height="18" rx="3" fill="#0b1020"/><rect x="75" y="-9" width="6" height="18" rx="3" fill="#0b1020"/>
<rect x="-34" y="-16" width="40" height="32" rx="8" fill="url(#nc-wifi)"/>
<rect x="6" y="-9" width="13" height="5" rx="2" fill="#cfd8ea"/><rect x="6" y="4" width="13" height="5" rx="2" fill="#cfd8ea"/>
<path d="M28 -15 l-6 13 h11 l-6 13" fill="none" stroke="#FFB020" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><animate attributeName="opacity" values="1;.15;1" dur="1.3s" repeatCount="indefinite"/></path>
</g>
<g transform="translate(66 258)" fill="#fff" fillOpacity=".16">
<rect x="0" y="38" width="12" height="14" rx="3"/><rect x="18" y="26" width="12" height="26" rx="3"/><rect x="36" y="13" width="12" height="39" rx="3"/><rect x="54" y="0" width="12" height="52" rx="3"/>
</g>
<path d="M60 318 L142 252" stroke="#FF3D9A" strokeWidth="5" strokeLinecap="round"/>
<path transform="translate(470 150) scale(1)" d="M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2 Z" fill="#fff" fillOpacity="0.8"><animate attributeName="fill-opacity" values="0.8;.1;0.8" dur="2.2s" begin="0s" repeatCount="indefinite"/></path><path transform="translate(112 196) scale(0.8)" d="M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2 Z" fill="#00C2D1" fillOpacity="0.8"><animate attributeName="fill-opacity" values="0.8;.1;0.8" dur="2.8s" begin="0.6s" repeatCount="indefinite"/></path><path transform="translate(300 44) scale(0.9)" d="M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2 Z" fill="#FF3D9A" fillOpacity="0.8"><animate attributeName="fill-opacity" values="0.8;.1;0.8" dur="2.5s" begin="1.1s" repeatCount="indefinite"/></path><path transform="translate(506 236) scale(0.7)" d="M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2 Z" fill="#FFB020" fillOpacity="0.8"><animate attributeName="fill-opacity" values="0.8;.1;0.8" dur="3s" begin="0.3s" repeatCount="indefinite"/></path>
<circle cx="170" cy="58" r="3" fill="#00C2D1" fillOpacity=".7"/><circle cx="446" cy="40" r="2.5" fill="#fff" fillOpacity=".5"/><circle cx="520" cy="190" r="3" fill="#FF3D9A" fillOpacity=".6"/>
</svg>
  );
}

export function MaintenanceIllustration({ className }: { className?: string }) {
  return (
<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" role="img" aria-label="Engineers performing system maintenance on servers" focusable="false">
<defs>
<linearGradient id="mt-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b1445"/><stop offset="1" stopColor="#0b1020"/></linearGradient>
<linearGradient id="mt-bar" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#00C2D1"/><stop offset="1" stopColor="#7B2CBF"/></linearGradient>
<linearGradient id="mt-prog" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#00C2D1"/><stop offset=".6" stopColor="#7B2CBF"/><stop offset="1" stopColor="#FF3D9A"/></linearGradient>
<pattern id="mt-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#fff" strokeOpacity=".05"/></pattern>
<pattern id="mt-hazard" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="28" fill="#FFC93C"/><rect x="14" width="14" height="28" fill="#1a1d2b"/></pattern>
<clipPath id="mt-clip"><rect x="16" y="16" width="608" height="368" rx="28"/></clipPath>
</defs>
<rect x="16" y="16" width="608" height="368" rx="28" fill="url(#mt-bg)" stroke="#fff" strokeOpacity=".12"/>
<g clipPath="url(#mt-clip)">
<rect x="16" y="16" width="608" height="368" fill="url(#mt-grid)"/>
<rect x="16" y="16" width="608" height="40" fill="#fff" fillOpacity=".05"/>
<circle cx="42" cy="36" r="5" fill="#FF3D9A"/><circle cx="58" cy="36" r="5" fill="#FFB020"/><circle cx="74" cy="36" r="5" fill="#3DFFA2"/>
<text x="320" y="40" textAnchor="middle" fontFamily="system-ui, -apple-system, Segoe UI, sans-serif" fontSize="12" fontWeight="700" letterSpacing="2" fill="#cfd8ff">SYSTEM MAINTENANCE IN PROGRESS</text>
<rect x="16" y="346" width="608" height="38" fill="#0a0f1d"/>
<rect x="16" y="364" width="608" height="20" fill="url(#mt-hazard)"/>
<rect x="44" y="84" width="104" height="250" rx="12" fill="#1d2440" stroke="#fff" strokeOpacity=".12"/><rect x="54" y="96" width="84" height="38" rx="6" fill="#121830" stroke="#fff" strokeOpacity=".08"/><circle cx="68" cy="109" r="3.5" fill="#3DFFA2"><animate attributeName="opacity" values="1;.25;1" dur="1.6s" begin="0.0s" repeatCount="indefinite"/></circle><circle cx="81" cy="109" r="3.5" fill="#3DFFA2"><animate attributeName="opacity" values="1;.25;1" dur="2.0s" begin="0.0s" repeatCount="indefinite"/></circle><rect x="98" y="104" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="98" y="111" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="98" y="118" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="66" y="121" width="52" height="5" rx="2.5" fill="url(#mt-bar)" fillOpacity=".55"/><rect x="54" y="142" width="84" height="38" rx="6" fill="#121830" stroke="#fff" strokeOpacity=".08"/><circle cx="68" cy="155" r="3.5" fill="#3DFFA2"><animate attributeName="opacity" values="1;.25;1" dur="2.0s" begin="0.3s" repeatCount="indefinite"/></circle><circle cx="81" cy="155" r="3.5" fill="#FFB020"><animate attributeName="opacity" values="1;.25;1" dur="2.4000000000000004s" begin="0.3s" repeatCount="indefinite"/></circle><rect x="98" y="150" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="98" y="157" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="98" y="164" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="66" y="167" width="52" height="5" rx="2.5" fill="url(#mt-bar)" fillOpacity=".55"/><rect x="54" y="188" width="84" height="38" rx="6" fill="#121830" stroke="#fff" strokeOpacity=".08"/><circle cx="68" cy="201" r="3.5" fill="#FFB020"><animate attributeName="opacity" values="1;.25;1" dur="2.4000000000000004s" begin="0.6s" repeatCount="indefinite"/></circle><circle cx="81" cy="201" r="3.5" fill="#3DFFA2"><animate attributeName="opacity" values="1;.25;1" dur="1.6s" begin="0.6s" repeatCount="indefinite"/></circle><rect x="98" y="196" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="98" y="203" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="98" y="210" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="66" y="213" width="52" height="5" rx="2.5" fill="url(#mt-bar)" fillOpacity=".55"/><rect x="54" y="234" width="84" height="38" rx="6" fill="#121830" stroke="#fff" strokeOpacity=".08"/><circle cx="68" cy="247" r="3.5" fill="#3DFFA2"><animate attributeName="opacity" values="1;.25;1" dur="1.6s" begin="0.9s" repeatCount="indefinite"/></circle><circle cx="81" cy="247" r="3.5" fill="#FF3D9A"><animate attributeName="opacity" values="1;.25;1" dur="2.0s" begin="0.9s" repeatCount="indefinite"/></circle><rect x="98" y="242" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="98" y="249" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="98" y="256" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="66" y="259" width="52" height="5" rx="2.5" fill="url(#mt-bar)" fillOpacity=".55"/><rect x="54" y="280" width="84" height="38" rx="6" fill="#121830" stroke="#fff" strokeOpacity=".08"/><circle cx="68" cy="293" r="3.5" fill="#FF3D9A"><animate attributeName="opacity" values="1;.25;1" dur="2.0s" begin="1.2s" repeatCount="indefinite"/></circle><circle cx="81" cy="293" r="3.5" fill="#3DFFA2"><animate attributeName="opacity" values="1;.25;1" dur="2.4000000000000004s" begin="1.2s" repeatCount="indefinite"/></circle><rect x="98" y="288" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="98" y="295" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="98" y="302" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="66" y="305" width="52" height="5" rx="2.5" fill="url(#mt-bar)" fillOpacity=".55"/>
<rect x="492" y="84" width="104" height="250" rx="12" fill="#1d2440" stroke="#fff" strokeOpacity=".12"/><rect x="502" y="96" width="84" height="38" rx="6" fill="#121830" stroke="#fff" strokeOpacity=".08"/><circle cx="516" cy="109" r="3.5" fill="#3DFFA2"><animate attributeName="opacity" values="1;.25;1" dur="1.6s" begin="0.0s" repeatCount="indefinite"/></circle><circle cx="529" cy="109" r="3.5" fill="#FFB020"><animate attributeName="opacity" values="1;.25;1" dur="2.0s" begin="0.0s" repeatCount="indefinite"/></circle><rect x="546" y="104" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="546" y="111" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="546" y="118" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="514" y="121" width="52" height="5" rx="2.5" fill="url(#mt-bar)" fillOpacity=".55"/><rect x="502" y="142" width="84" height="38" rx="6" fill="#121830" stroke="#fff" strokeOpacity=".08"/><circle cx="516" cy="155" r="3.5" fill="#FFB020"><animate attributeName="opacity" values="1;.25;1" dur="2.0s" begin="0.3s" repeatCount="indefinite"/></circle><circle cx="529" cy="155" r="3.5" fill="#3DFFA2"><animate attributeName="opacity" values="1;.25;1" dur="2.4000000000000004s" begin="0.3s" repeatCount="indefinite"/></circle><rect x="546" y="150" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="546" y="157" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="546" y="164" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="514" y="167" width="52" height="5" rx="2.5" fill="url(#mt-bar)" fillOpacity=".55"/><rect x="502" y="188" width="84" height="38" rx="6" fill="#121830" stroke="#fff" strokeOpacity=".08"/><circle cx="516" cy="201" r="3.5" fill="#3DFFA2"><animate attributeName="opacity" values="1;.25;1" dur="2.4000000000000004s" begin="0.6s" repeatCount="indefinite"/></circle><circle cx="529" cy="201" r="3.5" fill="#00C2D1"><animate attributeName="opacity" values="1;.25;1" dur="1.6s" begin="0.6s" repeatCount="indefinite"/></circle><rect x="546" y="196" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="546" y="203" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="546" y="210" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="514" y="213" width="52" height="5" rx="2.5" fill="url(#mt-bar)" fillOpacity=".55"/><rect x="502" y="234" width="84" height="38" rx="6" fill="#121830" stroke="#fff" strokeOpacity=".08"/><circle cx="516" cy="247" r="3.5" fill="#00C2D1"><animate attributeName="opacity" values="1;.25;1" dur="1.6s" begin="0.9s" repeatCount="indefinite"/></circle><circle cx="529" cy="247" r="3.5" fill="#3DFFA2"><animate attributeName="opacity" values="1;.25;1" dur="2.0s" begin="0.9s" repeatCount="indefinite"/></circle><rect x="546" y="242" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="546" y="249" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="546" y="256" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="514" y="259" width="52" height="5" rx="2.5" fill="url(#mt-bar)" fillOpacity=".55"/><rect x="502" y="280" width="84" height="38" rx="6" fill="#121830" stroke="#fff" strokeOpacity=".08"/><circle cx="516" cy="293" r="3.5" fill="#3DFFA2"><animate attributeName="opacity" values="1;.25;1" dur="2.0s" begin="1.2s" repeatCount="indefinite"/></circle><circle cx="529" cy="293" r="3.5" fill="#3DFFA2"><animate attributeName="opacity" values="1;.25;1" dur="2.4000000000000004s" begin="1.2s" repeatCount="indefinite"/></circle><rect x="546" y="288" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="546" y="295" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="546" y="302" width="20" height="3" rx="1.5" fill="#fff" fillOpacity=".12"/><rect x="514" y="305" width="52" height="5" rx="2.5" fill="url(#mt-bar)" fillOpacity=".55"/>
<path d="M148 196 C166 196 166 236 182 236" fill="none" stroke="#00C2D1" strokeOpacity=".7" strokeWidth="3"/>
<path d="M492 196 C474 196 474 236 458 236" fill="none" stroke="#FF3D9A" strokeOpacity=".7" strokeWidth="3"/>
<rect x="150" y="306" width="340" height="10" rx="5" fill="#232c52"/><rect x="170" y="316" width="10" height="30" fill="#1d2440"/><rect x="460" y="316" width="10" height="30" fill="#1d2440"/>
<rect x="300" y="274" width="40" height="24" fill="#1d2440"/><rect x="268" y="296" width="104" height="10" rx="5" fill="#232c52"/>
<rect x="182" y="84" width="276" height="190" rx="18" fill="#1d2440" stroke="#fff" strokeOpacity=".12"/>
<rect x="190" y="92" width="260" height="174" rx="12" fill="#0b1020"/>
<rect x="200" y="100" width="240" height="16" rx="8" fill="#fff" fillOpacity=".06"/>
<circle cx="212" cy="108" r="3" fill="#FF3D9A"/><circle cx="222" cy="108" r="3" fill="#FFB020"/><circle cx="232" cy="108" r="3" fill="#3DFFA2"/>
<text x="244" y="111.5" fontFamily="system-ui, -apple-system, Segoe UI, sans-serif" fontSize="9" fill="#9fb3d9">System Management</text>
<path d="M204 198 H306" stroke="#fff" strokeOpacity=".18"/>
<rect x="208" y="164" width="18" height="34" rx="4" fill="url(#mt-bar)"/><rect x="234" y="140" width="18" height="58" rx="4" fill="url(#mt-bar)"/><rect x="260" y="154" width="18" height="44" rx="4" fill="url(#mt-bar)"/><rect x="286" y="126" width="18" height="72" rx="4" fill="url(#mt-bar)"/>
<g><circle cx="384" cy="152" r="27" fill="none" stroke="#FFB020" strokeWidth="10" strokeDasharray="9 5.1"/><circle cx="384" cy="152" r="19" fill="#0b1020" stroke="#FFB020" strokeWidth="6"/><circle cx="384" cy="152" r="5" fill="#FFB020"/><animateTransform attributeName="transform" type="rotate" from="0 384 152" to="360 384 152" dur="14s" repeatCount="indefinite"/></g>
<text x="204" y="226" fontFamily="system-ui, -apple-system, Segoe UI, sans-serif" fontSize="10" fill="#e6ecff">Upgrading system… 72%</text>
<rect x="204" y="233" width="232" height="10" rx="5" fill="#fff" fillOpacity=".1"/><rect x="204" y="233" width="167" height="10" rx="5" fill="url(#mt-prog)"/>
<text x="204" y="259" fontFamily="system-ui, -apple-system, Segoe UI, sans-serif" fontSize="9" fill="#3DFFA2">● 3 of 4 servers online</text>
<text x="436" y="259" textAnchor="end" fontFamily="system-ui, -apple-system, Segoe UI, sans-serif" fontSize="9" fill="#FFB020">Back soon</text>
<polygon points="320,306 303,344 337,344" fill="#FF6A1F"/><polygon points="312.8,322 327.2,322 331.6,332 308.4,332" fill="#fff"/><rect x="299" y="343" width="42" height="6" rx="3" fill="#cc4f10"/>
<g transform="translate(172 352) scale(-1 1)">
<ellipse cx="0" cy="2" rx="34" ry="5" fill="#000" opacity=".4"/>
<path d="M-24 -110 L-32 -72" stroke="#3A86FF" strokeWidth="13" strokeLinecap="round"/>
<path d="M24 -110 L50 -98" stroke="#3A86FF" strokeWidth="13" strokeLinecap="round"/>
<rect x="-18" y="-64" width="15" height="58" rx="5" fill="#2b3350"/><rect x="3" y="-64" width="15" height="58" rx="5" fill="#2b3350"/>
<rect x="-22" y="-10" width="20" height="10" rx="4" fill="#161a28"/><rect x="2" y="-10" width="20" height="10" rx="4" fill="#161a28"/>
<rect x="-24" y="-122" width="48" height="66" rx="12" fill="#3A86FF"/>
<path d="M-22 -118 h14 l8 14 l8 -14 h14 v58 a8 8 0 0 1 -8 8 h-28 a8 8 0 0 1 -8 -8 z" fill="#FF8A1F"/>
<rect x="-22" y="-96" width="44" height="6" fill="#FFF3C4"/><rect x="-22" y="-80" width="44" height="6" fill="#FFF3C4"/>
<rect x="-5" y="-126" width="10" height="10" fill="#8D5524"/>
<circle cx="0" cy="-136" r="15" fill="#8D5524"/>
<path d="M-18 -138 a18 18 0 0 1 36 0 z" fill="#FFC93C"/><rect x="-23" y="-139" width="46" height="6" rx="3" fill="#FFB300"/><rect x="-3" y="-157" width="6" height="19" rx="3" fill="#FFB300" fillOpacity=".85"/>
<circle cx="-5" cy="-133" r="1.8" fill="#1a1a1a"/><circle cx="5" cy="-133" r="1.8" fill="#1a1a1a"/><path d="M-5 -127 q5 5 10 0" stroke="#1a1a1a" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
<circle cx="-33" cy="-66" r="6" fill="#8D5524"/>
<path d="M52 -97 L72 -118" stroke="#cfd8ea" strokeWidth="5" strokeLinecap="round" fill="none"/><circle cx="75" cy="-121" r="7" fill="none" stroke="#cfd8ea" strokeWidth="4"/><circle cx="52" cy="-97" r="6" fill="#8D5524"/>
</g>
<g transform="translate(470 352)">
<ellipse cx="0" cy="2" rx="34" ry="5" fill="#000" opacity=".4"/>
<path d="M-24 -110 L-32 -72" stroke="#7B2CBF" strokeWidth="13" strokeLinecap="round"/>
<path d="M24 -110 L44 -92" stroke="#7B2CBF" strokeWidth="13" strokeLinecap="round"/>
<rect x="-18" y="-64" width="15" height="58" rx="5" fill="#2b3350"/><rect x="3" y="-64" width="15" height="58" rx="5" fill="#2b3350"/>
<rect x="-22" y="-10" width="20" height="10" rx="4" fill="#161a28"/><rect x="2" y="-10" width="20" height="10" rx="4" fill="#161a28"/>
<rect x="-24" y="-122" width="48" height="66" rx="12" fill="#7B2CBF"/>
<path d="M-22 -118 h14 l8 14 l8 -14 h14 v58 a8 8 0 0 1 -8 8 h-28 a8 8 0 0 1 -8 -8 z" fill="#FF8A1F"/>
<rect x="-22" y="-96" width="44" height="6" fill="#FFF3C4"/><rect x="-22" y="-80" width="44" height="6" fill="#FFF3C4"/>
<rect x="-5" y="-126" width="10" height="10" fill="#F1C27D"/>
<circle cx="0" cy="-136" r="15" fill="#F1C27D"/>
<path d="M-18 -138 a18 18 0 0 1 36 0 z" fill="#FFC93C"/><rect x="-23" y="-139" width="46" height="6" rx="3" fill="#FFB300"/><rect x="-3" y="-157" width="6" height="19" rx="3" fill="#FFB300" fillOpacity=".85"/>
<circle cx="-5" cy="-133" r="1.8" fill="#1a1a1a"/><circle cx="5" cy="-133" r="1.8" fill="#1a1a1a"/><path d="M-5 -127 q5 5 10 0" stroke="#1a1a1a" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
<circle cx="-33" cy="-66" r="6" fill="#F1C27D"/>
<g transform="translate(50 -92) rotate(-12)"><rect x="-2" y="-28" width="26" height="34" rx="4" fill="#0b1020" stroke="#3A86FF" strokeWidth="2"/><rect x="3" y="-23" width="16" height="4" rx="2" fill="url(#mt-prog)"/><rect x="3" y="-14" width="11" height="3" rx="1.5" fill="#fff" fillOpacity=".45"/><rect x="3" y="-8" width="15" height="3" rx="1.5" fill="#fff" fillOpacity=".45"/></g><circle cx="46" cy="-91" r="6" fill="#F1C27D"/>
</g>
<path transform="translate(120 70) scale(0.8)" d="M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2 Z" fill="#FFB020" fillOpacity="0.8"><animate attributeName="fill-opacity" values="0.8;.1;0.8" dur="2.6s" begin="0s" repeatCount="indefinite"/></path><path transform="translate(540 70) scale(0.8)" d="M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2 Z" fill="#00C2D1" fillOpacity="0.8"><animate attributeName="fill-opacity" values="0.8;.1;0.8" dur="3s" begin="0.7s" repeatCount="indefinite"/></path>
</g>
</svg>
  );
}

export function NotFoundIllustration({ className }: { className?: string }) {
  return (
<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 360" role="img" aria-label="Page not found" focusable="false">
<defs>
<radialGradient id="nf-glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#3A86FF" stopOpacity=".45"/><stop offset="60%" stopColor="#7B2CBF" stopOpacity=".14"/><stop offset="100%" stopColor="#7B2CBF" stopOpacity="0"/></radialGradient>
<linearGradient id="nf-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#00C2D1"/><stop offset=".5" stopColor="#7B2CBF"/><stop offset="1" stopColor="#FF3D9A"/></linearGradient>
</defs>
<ellipse cx="280" cy="180" rx="262" ry="170" fill="url(#nf-glow)"/>
<path d="M50 316 C130 330 220 300 340 272" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="3" strokeDasharray="4 9" strokeLinecap="round"/>
<rect x="96" y="52" width="368" height="236" rx="22" fill="#101733" stroke="#fff" strokeOpacity=".14"/>
<path d="M96 74 a22 22 0 0 1 22 -22 h324 a22 22 0 0 1 22 22 v22 h-368 z" fill="#fff" fillOpacity=".07"/>
<circle cx="120" cy="74" r="5" fill="#FF3D9A"/><circle cx="138" cy="74" r="5" fill="#FFB020"/><circle cx="156" cy="74" r="5" fill="#3DFFA2"/>
<rect x="180" y="62" width="262" height="24" rx="12" fill="#fff" fillOpacity=".09"/>
<text x="196" y="78" fontFamily="system-ui, -apple-system, Segoe UI, sans-serif" fontSize="11" fill="#9fb3d9">colltechhub.com/???</text>
<text x="280" y="204" textAnchor="middle" fontFamily="system-ui, -apple-system, Segoe UI, sans-serif" fontSize="100" fontWeight="800" fill="url(#nf-g)">404</text>
<text x="280" y="240" textAnchor="middle" fontFamily="system-ui, -apple-system, Segoe UI, sans-serif" fontSize="15" fill="#9fb3d9">Page not found</text>
<g transform="translate(408 252)"><circle r="46" fill="#fff" fillOpacity=".07" stroke="url(#nf-g)" strokeWidth="10"/><path d="M33 33 L70 70" stroke="#7B2CBF" strokeWidth="16" strokeLinecap="round"/><text x="0" y="15" textAnchor="middle" fontFamily="system-ui, -apple-system, Segoe UI, sans-serif" fontSize="46" fontWeight="700" fill="#fff">?</text></g>
<text x="62" y="130" fontFamily="system-ui, sans-serif" fontSize="30" fontWeight="700" fill="#00C2D1" fillOpacity=".7">?</text>
<text x="498" y="120" fontFamily="system-ui, sans-serif" fontSize="26" fontWeight="700" fill="#FF3D9A" fillOpacity=".7">?</text>
<circle cx="60" cy="220" r="14" fill="#7B2CBF" fillOpacity=".5"/><circle cx="522" cy="226" r="9" fill="#00C2D1" fillOpacity=".5"/>
<path transform="translate(500 60) scale(0.9)" d="M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2 Z" fill="#fff" fillOpacity="0.8"><animate attributeName="fill-opacity" values="0.8;.1;0.8" dur="2.4s" begin="0s" repeatCount="indefinite"/></path><path transform="translate(76 60) scale(0.7)" d="M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2 Z" fill="#FFB020" fillOpacity="0.8"><animate attributeName="fill-opacity" values="0.8;.1;0.8" dur="2.9s" begin="0.5s" repeatCount="indefinite"/></path><path transform="translate(300 330) scale(0.8)" d="M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2 Z" fill="#FF3D9A" fillOpacity="0.8"><animate attributeName="fill-opacity" values="0.8;.1;0.8" dur="2.6s" begin="1s" repeatCount="indefinite"/></path>
</svg>
  );
}

export function ServerErrorIllustration({ className }: { className?: string }) {
  return (
<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 360" role="img" aria-label="Server error" focusable="false">
<defs>
<radialGradient id="se-glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#FF3D9A" stopOpacity=".4"/><stop offset="60%" stopColor="#7B2CBF" stopOpacity=".14"/><stop offset="100%" stopColor="#7B2CBF" stopOpacity="0"/></radialGradient>
<linearGradient id="se-warn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFB020"/><stop offset="1" stopColor="#FF3D9A"/></linearGradient>
</defs>
<ellipse cx="280" cy="180" rx="262" ry="170" fill="url(#se-glow)"/>
<ellipse cx="280" cy="318" rx="130" ry="12" fill="#000" fillOpacity=".4"/>
<rect x="170" y="112" width="220" height="56" rx="12" fill="#121a3a" stroke="#fff" strokeOpacity=".14"/><circle cx="198" cy="140" r="4.5" fill="#FF3D9A"><animate attributeName="opacity" values="1;.2;1" dur="1.2s" repeatCount="indefinite"/></circle><circle cx="214" cy="140" r="4.5" fill="#FFB020"><animate attributeName="opacity" values="1;.2;1" dur="1.5499999999999998s" repeatCount="indefinite"/></circle><circle cx="230" cy="140" r="4.5" fill="#3DFFA2"><animate attributeName="opacity" values="1;.2;1" dur="1.9s" repeatCount="indefinite"/></circle><rect x="262" y="126" width="86" height="3.5" rx="1.75" fill="#fff" fillOpacity=".14"/><rect x="262" y="135" width="78" height="3.5" rx="1.75" fill="#fff" fillOpacity=".14"/><rect x="262" y="144" width="70" height="3.5" rx="1.75" fill="#fff" fillOpacity=".14"/><rect x="262" y="153" width="62" height="3.5" rx="1.75" fill="#fff" fillOpacity=".14"/><circle cx="362" cy="140" r="9" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="3"/><rect x="170" y="176" width="220" height="56" rx="12" fill="#121a3a" stroke="#fff" strokeOpacity=".14"/><circle cx="198" cy="204" r="4.5" fill="#FF3D9A"><animate attributeName="opacity" values="1;.2;1" dur="1.2s" repeatCount="indefinite"/></circle><circle cx="214" cy="204" r="4.5" fill="#FF3D9A"><animate attributeName="opacity" values="1;.2;1" dur="1.5499999999999998s" repeatCount="indefinite"/></circle><circle cx="230" cy="204" r="4.5" fill="#FFB020"><animate attributeName="opacity" values="1;.2;1" dur="1.9s" repeatCount="indefinite"/></circle><rect x="262" y="190" width="86" height="3.5" rx="1.75" fill="#fff" fillOpacity=".14"/><rect x="262" y="199" width="78" height="3.5" rx="1.75" fill="#fff" fillOpacity=".14"/><rect x="262" y="208" width="70" height="3.5" rx="1.75" fill="#fff" fillOpacity=".14"/><rect x="262" y="217" width="62" height="3.5" rx="1.75" fill="#fff" fillOpacity=".14"/><circle cx="362" cy="204" r="9" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="3"/><rect x="170" y="240" width="220" height="56" rx="12" fill="#121a3a" stroke="#fff" strokeOpacity=".14"/><circle cx="198" cy="268" r="4.5" fill="#3DFFA2"><animate attributeName="opacity" values="1;.2;1" dur="1.2s" repeatCount="indefinite"/></circle><circle cx="214" cy="268" r="4.5" fill="#FFB020"><animate attributeName="opacity" values="1;.2;1" dur="1.5499999999999998s" repeatCount="indefinite"/></circle><circle cx="230" cy="268" r="4.5" fill="#3DFFA2"><animate attributeName="opacity" values="1;.2;1" dur="1.9s" repeatCount="indefinite"/></circle><rect x="262" y="254" width="86" height="3.5" rx="1.75" fill="#fff" fillOpacity=".14"/><rect x="262" y="263" width="78" height="3.5" rx="1.75" fill="#fff" fillOpacity=".14"/><rect x="262" y="272" width="70" height="3.5" rx="1.75" fill="#fff" fillOpacity=".14"/><rect x="262" y="281" width="62" height="3.5" rx="1.75" fill="#fff" fillOpacity=".14"/><circle cx="362" cy="268" r="9" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="3"/>
<path d="M300 176 l-14 20 l16 8 l-12 24" fill="none" stroke="#FF3D9A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
<circle cx="262" cy="90" r="20" fill="#fff" fillOpacity=".1"/><circle cx="288" cy="68" r="15" fill="#fff" fillOpacity=".08"/><circle cx="310" cy="48" r="10" fill="#fff" fillOpacity=".06"/>
<path d="M398 120 l14 -18 l-6 -2 l16 -22" fill="none" stroke="#FFB020" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><animate attributeName="opacity" values="1;.2;1" dur="1.2s" repeatCount="indefinite"/></path>
<g transform="translate(120 128)"><path d="M0 -50 L48 36 H-48 Z" fill="url(#se-warn)" stroke="url(#se-warn)" strokeWidth="10" strokeLinejoin="round"/><rect x="-4.5" y="-18" width="9" height="30" rx="4.5" fill="#1a1033"/><circle cy="24" r="5.5" fill="#1a1033"/></g>
<g transform="translate(440 270)"><circle r="30" fill="none" stroke="#FFB020" strokeWidth="10" strokeDasharray="9 5"/><circle r="21" fill="#0f1530" stroke="#FFB020" strokeWidth="6"/><circle r="6" fill="#FFB020"/></g>
<path transform="translate(480 120) scale(0.8)" d="M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2 Z" fill="#fff" fillOpacity="0.8"><animate attributeName="fill-opacity" values="0.8;.1;0.8" dur="2.4s" begin="0s" repeatCount="indefinite"/></path><path transform="translate(84 266) scale(0.8)" d="M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2 Z" fill="#00C2D1" fillOpacity="0.8"><animate attributeName="fill-opacity" values="0.8;.1;0.8" dur="2.8s" begin="0.6s" repeatCount="indefinite"/></path><path transform="translate(300 26) scale(0.7)" d="M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2 Z" fill="#FFB020" fillOpacity="0.8"><animate attributeName="fill-opacity" values="0.8;.1;0.8" dur="2.5s" begin="1s" repeatCount="indefinite"/></path>
</svg>
  );
}

export function AccessDeniedIllustration({ className }: { className?: string }) {
  return (
<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 360" role="img" aria-label="Access denied" focusable="false">
<defs>
<radialGradient id="ad-glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#7B2CBF" stopOpacity=".5"/><stop offset="60%" stopColor="#00C2D1" stopOpacity=".12"/><stop offset="100%" stopColor="#00C2D1" stopOpacity="0"/></radialGradient>
<linearGradient id="ad-shield" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#00C2D1"/><stop offset=".55" stopColor="#3A86FF"/><stop offset="1" stopColor="#7B2CBF"/></linearGradient>
<linearGradient id="ad-pink" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FF3D9A"/><stop offset="1" stopColor="#FFB020"/></linearGradient>
</defs>
<ellipse cx="280" cy="180" rx="262" ry="170" fill="url(#ad-glow)"/>
<circle cx="280" cy="184" r="150" fill="none" stroke="#fff" strokeOpacity=".12" strokeDasharray="3 9"/>
<path d="M280 44 L388 82 V184 C388 252 342 298 280 324 C218 298 172 252 172 184 V82 Z" fill="url(#ad-shield)"/>
<path d="M280 44 L388 82 V184 C388 252 342 298 280 324 C218 298 172 252 172 184 V82 Z" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="3"/>
<path d="M280 64 L370 94 V184 C370 242 332 282 280 304 C228 282 190 242 190 184 V94 Z" fill="#0f1530" fillOpacity=".55"/>
<path d="M258 168 v-20 a22 22 0 0 1 44 0 v20" fill="none" stroke="#fff" strokeWidth="12" strokeLinecap="round"/>
<rect x="240" y="166" width="80" height="62" rx="12" fill="#fff"/>
<circle cx="280" cy="192" r="8" fill="#7B2CBF"/><rect x="276" y="196" width="8" height="18" rx="4" fill="#7B2CBF"/>
<g transform="translate(396 262)"><circle r="32" fill="url(#ad-pink)"/><circle r="32" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="2"/><path d="M-12 -12 L12 12 M12 -12 L-12 12" stroke="#fff" strokeWidth="8" strokeLinecap="round"/></g>
<g transform="translate(96 232) rotate(-30)"><circle r="16" fill="none" stroke="#FFB020" strokeWidth="7"/><path d="M16 0 H70 M52 0 v14 M64 0 v10" stroke="#FFB020" strokeWidth="7" strokeLinecap="round" fill="none"/></g>
<path transform="translate(470 110) scale(0.9)" d="M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2 Z" fill="#fff" fillOpacity="0.8"><animate attributeName="fill-opacity" values="0.8;.1;0.8" dur="2.4s" begin="0s" repeatCount="indefinite"/></path><path transform="translate(98 100) scale(0.8)" d="M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2 Z" fill="#00C2D1" fillOpacity="0.8"><animate attributeName="fill-opacity" values="0.8;.1;0.8" dur="2.8s" begin="0.6s" repeatCount="indefinite"/></path><path transform="translate(300 340) scale(0.7)" d="M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2 Z" fill="#FF3D9A" fillOpacity="0.8"><animate attributeName="fill-opacity" values="0.8;.1;0.8" dur="2.6s" begin="1s" repeatCount="indefinite"/></path>
</svg>
  );
}