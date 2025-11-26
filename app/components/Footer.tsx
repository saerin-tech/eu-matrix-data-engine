export default function Footer() {
  return (
    <footer className="w-full mt-8 py-2 text-center bg-slate-900/80 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-md">
      <p className="text-gray-400 text-sm tracking-wide">
        CopyRight © {new Date().getFullYear()} <span className="text-white font-semibold">Saerin Tech</span>. All rights reserved.
      </p>
    </footer>
  );
}
