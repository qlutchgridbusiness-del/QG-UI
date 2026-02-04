import {
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaWhatsapp,
} from "react-icons/fa";
import { FaX } from "react-icons/fa6";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-100/80 dark:bg-slate-900/80 border-t border-gray-200 dark:border-slate-800 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-5 space-y-4">

        {/* Social Icons */}
        <div className="flex justify-center gap-6">
          <a
            href="https://instagram.com/qlutchgrid"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-gray-500 hover:text-pink-600 transition text-xl"
          >
            <FaInstagram />
          </a>

          <a
            href="https://facebook.com/qlutchgrid"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-gray-500 hover:text-blue-600 transition text-xl"
          >
            <FaFacebook />
          </a>

          <a
            href="https://x.com/QlutchGrid"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
            className="text-gray-500 hover:text-black transition text-xl"
          >
            <FaX />
          </a>

          <a
            href="https://linkedin.com/company/qlutchgrid"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-gray-500 hover:text-blue-700 transition text-xl"
          >
            <FaLinkedin />
          </a>

          <a
            href="https://wa.me/919XXXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="text-gray-500 hover:text-green-600 transition text-xl"
          >
            <FaWhatsapp />
          </a>
        </div>

        {/* Legal + Contact Links */}
        <div className="flex justify-center gap-4 text-xs sm:text-sm text-gray-500 dark:text-slate-400 flex-wrap">
          <Link href="/contact-us" className="hover:text-gray-800 dark:hover:text-slate-200">
            Contact Us
          </Link>
          <span>•</span>
          <Link href="/privacy-policy" className="hover:text-gray-800 dark:hover:text-slate-200">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-gray-800 dark:hover:text-slate-200">
            Terms & Conditions
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-500 dark:text-slate-400 text-xs sm:text-sm">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold">QlutchGrid</span> — All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
