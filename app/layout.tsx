import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LegalProvider } from "@/components/LegalProvider";

export const metadata: Metadata = {
  title: "MANTEN LIMPIO",
  description: "Control de ingreso y salida en tiempo real",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>
        <LegalProvider>
          <header>
            <div className="wrap">
              <div className="brand">
                <div className="lg">
                  <svg viewBox="0 0 90 80" width="58" height="52" aria-label="MANTEN LIMPIO">
                    <polygon points="0,42 30,30 30,78 0,78" fill="#1a4a9c" />
                    <polygon points="30,30 46,35 46,78 30,78" fill="#2db3e8" />
                    <polygon points="46,22 58,10 58,78 46,78" fill="#1a4a9c" />
                    <polygon points="58,10 70,22 70,78 58,78" fill="#2db3e8" />
                    <polygon
                      fill="#fff"
                      points="72,15 73.7,25.8 82.6,19.4 76.2,28.3 87,30 76.2,31.7 82.6,40.6 73.7,34.2 72,45 70.3,34.2 61.4,40.6 67.8,31.7 57,30 67.8,28.3 61.4,19.4 70.3,25.8"
                      transform="translate(-8,-2)"
                    />
                    <path d="M0 60 L40 50" stroke="#fff" strokeWidth=".8" strokeDasharray="3 2" opacity=".6" />
                  </svg>
                  <div className="lt">
                    <b>MANTEN</b>
                    <b className="l2">LIMPIO</b>
                  </div>
                </div>
                <small>
                  Control de ingreso
                  <br />
                  en tiempo real
                </small>
              </div>
              <Nav />
            </div>
          </header>
          <main id="app">{children}</main>
          <Footer />
        </LegalProvider>
      </body>
    </html>
  );
}
