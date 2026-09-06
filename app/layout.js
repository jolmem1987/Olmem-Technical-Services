import './globals.css';

export const metadata = {
  metadataBase: new URL('https://www.olmemtechnicalservices.com'),
  title: {
    default: 'Olmem Technical Services | Industrial Maintenance & Machine Support',
    template: '%s | Olmem Technical Services'
  },
  description: 'Industrial maintenance, CNC machine support, troubleshooting, preventive maintenance, reliability support, and emergency service across Southeast Wisconsin and Northeast Illinois.',
  openGraph: {
    title: 'Olmem Technical Services',
    description: 'Industrial maintenance and machine support built around uptime, practical troubleshooting, and clear communication.',
    type: 'website',
    images: ['/olmem-technical-services-logo.png']
  },
  icons: { icon: '/olmem-technical-services-logo.png' }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
