import { GlobalDataProvider } from './contexts/GlobalDataContext';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <GlobalDataProvider>
          {children}
        </GlobalDataProvider>
      </body>
    </html>
  );
}