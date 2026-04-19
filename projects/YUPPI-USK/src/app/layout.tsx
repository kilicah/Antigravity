import "./globals.css";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased bg-slate-50 text-slate-900">
        <div className="flex h-screen overflow-hidden print:block print:h-auto print:overflow-visible">
          <Sidebar />
          <main className="flex-1 p-8 overflow-auto print:p-0 print:overflow-visible">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
