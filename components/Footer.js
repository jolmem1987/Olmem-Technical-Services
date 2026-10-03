import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Image src="/olmem-technical-services-logo.png" width={110} height={110} alt="Olmem Technical Services" />
          <p className="muted">Industrial maintenance and technical support focused on getting equipment running, keeping it reliable, and giving customers a clear path forward.</p>
        </div>
        <div><h3>Company</h3><Link href="/about">About</Link><Link href="/service-area">Service Area</Link><Link href="/contact">Request Service</Link><Link href="/privacy">Privacy Policy</Link></div>
        <div><h3>Services</h3><Link href="/services#cnc">CNC & Machine Support</Link><Link href="/services#breakdown">Breakdown Support</Link><Link href="/services#pm">Preventive Maintenance</Link></div>
      </div>
      <div className="container footer-bottom">© {new Date().getFullYear()} Olmem Technical Services. Independent industrial maintenance provider. Not affiliated with equipment manufacturers unless explicitly stated.</div>
    </footer>
  );
}
