"use client";

import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-white border-t border-gray-200 mt-24">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Logo and description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                {t("header.shops")}
              </span>
            </div>
            <p className="text-gray-600 text-sm"></p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  {t("footer.aboutUs")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Order Tracking
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              {t("footer.contact")}
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">support@example.com</p>
              <p className="text-gray-600">+84 (123).456-7890</p>
            </div>
            {/* Social icons */}
            <div className="flex gap-4 mt-6">
              <Button className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-900">
                <Facebook size={18} />
              </Button>
              <Button className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-900">
                <Twitter size={18} />
              </Button>
              <Button className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-900">
                <Instagram size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
