"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface FooterMenuItemType {
  title: string;
  path: string;
}

function FooterMenuItem({ item }: { item: FooterMenuItemType }) {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(pathname === item.path);
  }, [pathname, item.path]);

  return (
    <li>
      <Link
        href={item.path}
        className={clsx(
          "block p-2 text-lg underline-offset-4 hover:text-black hover:underline md:inline-block md:text-sm dark:hover:text-neutral-300",
          {
            "text-black dark:text-neutral-300": active,
          },
        )}
      >
        {item.title}
      </Link>
    </li>
  );
}

export default function FooterMenu({ menu }: { menu: FooterMenuItemType[] }) {
  if (!menu.length) return null;

  return (
    <nav>
      <ul>
        {menu.map((item) => (
          <FooterMenuItem key={item.path} item={item} />
        ))}
      </ul>
    </nav>
  );
}
