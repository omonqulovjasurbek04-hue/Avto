import './globals.css';
import { AppProvider } from '../context/AppContext';
import { AuthProvider } from '../context/AuthContext';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export const metadata = {
  title: 'AVTO QOIDALAR — Yo\'l Harakati Qoidalari Video Ta\'lim',
  description: 'Video savollar bilan YHQ va haydovchilik imtihoniga tayyorgarlik platformasi.',
};

export default function RootLayout({ children }) {
  return (
    <html className="dark">
      <body className="bg-bg-darkest text-slate-100 min-h-screen flex flex-col antialiased">
        <AppProvider>
          <AuthProvider>
            <Header />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </AppProvider>
      </body>
    </html>
  );
}
