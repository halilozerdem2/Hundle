import Image from 'next/image';
import Link from 'next/link';

const Header = () => (
  <header className="site-header">
    <Link href="/" className="site-header__brand">
      <Image src="/logo.png" alt="Hundle logo" width={32} height={32} />
      <span>Hundle</span>
    </Link>
  </header>
);

export default Header;
