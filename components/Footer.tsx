// File: components/Footer.tsx
export default function Footer() {
  return (
    <footer className="text-center py-4 px-6 border-t border-gray-200 text-xs text-slate-gray">
      &copy; {new Date().getFullYear()} ConstructCo Project Management. All rights reserved.
    </footer>
  );
}