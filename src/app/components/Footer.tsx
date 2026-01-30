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
    <footer className="bg-gray-100 border-t border-gray-200">
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
        <div className="flex justify-center gap-4 text-xs sm:text-sm text-gray-500 flex-wrap">
          <Link href="/contact-us" className="hover:text-gray-800">
            Contact Us
          </Link>
          <span>•</span>
          <Link href="/privacy-policy" className="hover:text-gray-800">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-gray-800">
            Terms & Conditions
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-500 text-xs sm:text-sm">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold">QlutchGrid</span> — All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
