import Image from 'next/image';
import Link from 'next/link';

const Header = () => (
  <header className="site-header">
    <Link href="/" className="site-header__brand">
      <span className="site-header__logo">
        <Image src="/logo.png" alt="Hundle logo" width={60} height={60} />
      </span>
      <span>Hundle</span>
    </Link>
  </header>
);

export default Header;
