import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaLinkedinIn } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-300">
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        
        {/* Brand Section */}
        <div>
          <h2 className="text-3xl font-extrabold text-white mb-4">COLTECH</h2>
          <p className="text-sm leading-relaxed text-gray-400">
            Your trusted store for <span className="text-white font-medium">quality tech & office essentials</span> — 
            from earphones & routers to paper reams & Bluetooth speakers. 
            Shop smart, shop COLLTECH.
          </p>
          <div className="flex items-center space-x-3 mt-6">
            {[FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaLinkedinIn].map((Icon, i) => (
              <a 
                key={i} 
                href="#" 
                className="p-2 rounded-full bg-gray-800 text-gray-300 hover:text-white hover:bg-blue-600 transition"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Shop Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Shop</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/category-product" className="hover:text-blue-500 transition">Earphones & AirPods</Link></li>
            <li><Link href="/category-product" className="hover:text-blue-500 transition">Bluetooth Speakers</Link></li>
            <li><Link href="/category-product" className="hover:text-blue-500 transition">Routers & Modems</Link></li>
            <li><Link href="/category-product" className="hover:text-blue-500 transition">Office Supplies</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Customer Care</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/faq" className="hover:text-blue-500 transition">FAQs</Link></li>
            <li><Link href="/support" className="hover:text-blue-500 transition">Help & Support</Link></li>
            <li><Link href="/returns" className="hover:text-blue-500 transition">Returns & Refunds</Link></li>
            <li><Link href="/contact" className="hover:text-blue-500 transition">Contact Us</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 py-4 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} <span className="text-blue-500 font-medium">COLLTECH</span>. Your Tech & Office Partner. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
