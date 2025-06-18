"use client";

import Link from "next/link";
import Image from "next/image";

export default function AuthHeader() {
  return (
    <header className="w-full bg-white/80 backdrop-blur-sm border-b border-tosca-200/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-tosca-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-tosca-600">S-Property</span>
          </Link>

          {/* Back to Home */}
          <Link 
            href="/"
            className="text-tosca-500 hover:text-tosca-600 transition-colors font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </header>
  );
}