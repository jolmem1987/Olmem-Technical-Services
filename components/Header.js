'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="site-header">
      <div className="topbar">Industrial Maintenance • Southeast Wisconsin + Northeast Illinois</div>
      <div className="nav-shell container">
        <Link className="brand" href="/" onClick={close}>
          <Image src="/olmem-technical-services-logo.png" width={68} height={68} alt="Olmem Technical Services logo" priority />
          <span><strong>OLMEM</strong><small>TECHNICAL SERVICES</small></span>
        </Link>
        <button className="menu-button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
        <nav className={open ? 'nav-links open' : 'nav-links'}>
          <Link href="/services" onClick={close}>Services</Link>
          <Link href="/about" onClick={close}>About</Link>
          <Link href="/service-area" onClick={close}>Service Area</Link>
          <Link href="/contact" onClick={close}>Contact</Link>
          <Link href="/contact" className="button button-sm" onClick={close}>Request Service</Link>
        </nav>
      </div>
    </header>
  );
}
