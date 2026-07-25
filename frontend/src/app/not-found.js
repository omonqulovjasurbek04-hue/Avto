import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-fade-in">
      <div className="text-6xl font-extrabold font-heading text-gradient">404</div>
      <h1 className="text-2xl font-bold font-heading text-slate-100">Sahifa topilmadi</h1>
      <p className="text-slate-400 text-sm">Qidirgan sahifangiz mavjud emas yoki ko'chirilgan.</p>
      <Link href="/" className="px-6 py-3 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-semibold transition-all">
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
}
