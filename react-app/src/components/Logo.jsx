import { Link } from 'react-router-dom';

const LOGO_SRC = '/assets/images/layastore-logo.png';

export default function Logo({ size = 'header', link = '/', className = '', onClick }) {
  const mark = (
    <img
      src={LOGO_SRC}
      alt="LayaStore - Fashion for You"
      className="h-7 w-auto sm:h-8 md:h-9"
      style={{ objectFit: 'contain', display: 'block' }}
      draggable={false}
      loading="eager"
      fetchpriority="high"
    />
  );

  const name = <span className="logo whitespace-nowrap">Laya<span>Store</span></span>;

  const inner = (
    <span className="inline-flex items-center gap-0">
      {mark}
      <span className="-ml-2">{name}</span>
    </span>
  );

  if (link) {
    return (
      <Link to={link} onClick={onClick} className={`inline-flex items-center ${className}`} aria-label="LayaStore Home">
        {inner}
      </Link>
    );
  }

  return inner;
}
