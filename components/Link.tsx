import NextLink from "next/link";
import { ReactNode } from "react";

export default function Link({
  href,
  className,
  rel,
  target,
  title,
  children,
}: {
  href: string;
  className?: string;
  rel?: string;
  target?: string;
  title?: string;
  children: ReactNode;
}) {
  return (
    <NextLink href={href}>
      <a
        className={className}
        rel={target === "_blank" && !rel ? "noreferrer noopener" : rel}
        title={title}
        target={target}
      >
        {children}
      </a>
    </NextLink>
  );
}
