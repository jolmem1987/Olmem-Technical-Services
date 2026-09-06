import Header from '@/components/Header';
import Footer from '@/components/Footer';

/** Public marketing chrome. The admin lives outside this group and has its own. */
export default function SiteLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
