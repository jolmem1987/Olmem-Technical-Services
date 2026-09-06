import '@/app/chatbot.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';

/** Public marketing chrome. The admin lives outside this group and has its own,
 *  which is also why the assistant mounts here rather than in the root layout —
 *  it should never appear over the internal dashboard. */
export default function SiteLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <Chatbot />
    </>
  );
}
