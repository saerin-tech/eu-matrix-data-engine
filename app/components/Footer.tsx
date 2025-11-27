import { Heart, Code, Globe, Mail, Github, Linkedin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-2 shadow-2xl mt-8 relative overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-blue-600/5 to-purple-600/5 animate-pulse"></div>
      
      <div className="relative">
        

        {/* Bottom section - Copyright */}
        <div className="flex flex-col items-center">
          
          
          <p className="text-xs text-gray-300">
            Copyright © {currentYear} Saerin Tech. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}