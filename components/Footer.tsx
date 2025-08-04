import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import Link from 'next/link';

const Footer = () => {
  const socialLinks = [
    { icon: FaFacebookF, url: "https://www.facebook.com/share/1AsYch1TgY/" },
    { icon: FaTwitter, url: "https://x.com/Colltech_?t=jSzzUB5EdP_scsjNpjkSKA&s=08" },
    { icon: FaInstagram, url: "https://www.instagram.com/COLLTECH" },
    { icon: FaYoutube, url: "https://www.tiktok.com/@colltechaccessori?_t=ZM-8yZPmRqhauG&_r=1" }, // Placeholder for TikTok
  ];

  return (
    <footer className="bg-gradient-to-b from-white via-gray-50 to-white text-gray-700">
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        
        {/* Brand Section */}
        <div>
          <h2 className="text-3xl font-extrabold text-[#00C2D1] mb-4">COLLTECH</h2>
          <p className="text-sm leading-relaxed text-gray-600">
            Your trusted store for <span className="text-gray-900 font-medium">quality tech & office essentials</span> — 
            from earphones & routers to paper reams & Bluetooth speakers. 
            Shop smart, shop COLLTECH.
          </p>

          {/* About & Blog Links */}
<div className="mt-4 flex space-x-4">
  <Link href="/about-us" className="text-sm text-[#7B2CBF] hover:underline">About Us</Link>
  <Link href="/blog" className="text-sm text-[#7B2CBF] hover:underline">Blog</Link>
</div>


          {/* Social Icons */}
          <div className="flex items-center space-x-3 mt-6">
            {socialLinks.map(({ icon: Icon, url }, i) => (
              <a 
                key={i} 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-200 text-gray-600 transition relative group"
              >
                <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF]"></span>
                <Icon className="relative z-10 group-hover:text-white transition" />
              </a>
            ))}
          </div>
        </div>

        {/* Shop Links */}
        <div>
          <h3 className="text-lg font-semibold text-[#00C2D1] mb-4 border-b border-gray-200 pb-2">Shop</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/category-product" className="hover:text-[#7B2CBF] transition">Earphones & AirPods</Link></li>
            <li><Link href="/category-product" className="hover:text-[#7B2CBF] transition">Bluetooth Speakers</Link></li>
            <li><Link href="/category-product" className="hover:text-[#7B2CBF] transition">Routers & Modems</Link></li>
            <li><Link href="/category-product" className="hover:text-[#7B2CBF] transition">Office Supplies</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h3 className="text-lg font-semibold text-[#00C2D1] mb-4 border-b border-gray-200 pb-2">Customer Care</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/faq" className="hover:text-[#7B2CBF] transition">FAQs</Link></li>
            <li><Link href="/support" className="hover:text-[#7B2CBF] transition">Help & Support</Link></li>
            <li><Link href="/returns" className="hover:text-[#7B2CBF] transition">Returns & Refunds</Link></li>
            <li><Link href="/contact" className="hover:text-[#7B2CBF] transition">Contact Us</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 py-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} <span className="text-[#00C2D1] font-medium">COLLTECH</span>. Your Tech & Office Partner. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
