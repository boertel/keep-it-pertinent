import NextLink from "next/link";
import { ReactNode } from "react";

export default function Link({
  href,
  className,
  rel,
  title,
  children,
}: {
  href: string;
  className?: string;
  rel?: string;
  title?: string;
  children: ReactNode;
}) {
  return (
    <NextLink href={href}>
      <a className={className} rel={rel} title={title}>
        {children}
      </a>
    </NextLink>
  );
}
