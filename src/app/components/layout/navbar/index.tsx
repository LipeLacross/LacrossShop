import CartModal from "@/app/components/cart/modal";
import LogoSquare from "@/app/components/logo-square";
import Link from "next/link";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu";
import Search, { SearchSkeleton } from "./search";
import { fetchCategories } from "@/app/lib/api";

const { SITE_NAME } = process.env;

export async function Navbar() {
  const categories = await fetchCategories();

  return (
    <nav className="relative flex items-center justify-between p-4 lg:px-6">
      <div className="block flex-none md:hidden">
        <Suspense fallback={null}>
          <MobileMenu menu={categories} />
        </Suspense>
      </div>

      <div className="flex w-full items-center">
        <div className="flex w-full md:w-1/3">
          <Link
            href="/"
            prefetch
            className="mr-2 flex w-full items-center justify-center md:w-auto lg:mr-6"
          >
            <LogoSquare />
            <div className="ml-2 flex-none text-sm font-medium uppercase md:hidden lg:block">
              {SITE_NAME}
            </div>
          </Link>

          {categories.length > 0 && (
            <ul className="hidden gap-6 text-sm md:flex md:items-center">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/search/${category.slug}`}
                    prefetch
                    className="text-neutral-500 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="hidden justify-center md:flex md:w-1/3">
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        </div>

        <div className="flex justify-end md:w-1/3">
          <CartModal />
        </div>
      </div>
    </nav>
  );
}
