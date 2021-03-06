import Link from "next/link";
import { ReactNode } from "react";
import cn from "classnames";

import Avatar from "./Avatar";

interface ExpendableUrl {
  displayUrl: string;
  expandedUrl: string;
}

interface BioProps {
  name?: string | ReactNode;
  username?: string | ReactNode;
  description?: string | ReactNode;
  avatar: string;
  urls?: any;
  className?: string;
}

export default function Bio({
  name = <>&nbsp;</>,
  username = "",
  description = <>&nbsp;</>,
  urls = [],
  avatar,
  className,
}: BioProps) {
  let website: ExpendableUrl | null = urls.length ? urls[0] : null;
  return (
    <>
      <div
        className={cn(
          "flex items-center justify-between space-x-2 mt-10",
          className
        )}
      >
        <div className="flex items-center space-x-2">
          <Avatar
            src={avatar}
            className="border-gray-400"
            alt={`${username} avatar`}
          />
          <div className="flex flex-col">
            <h1 className="text-xxl font-bold">{name}</h1>
            <Link href={`https://twitter.com/${username}`}>
              <a className="text-gray-500" target="_blank">
                <h3>{!!username && `@${username}`}</h3>
              </a>
            </Link>
          </div>
        </div>
        <div className="flex items-center">
          {website && (
            <Link href={website.expandedUrl}>
              <a className="text-blue-500" target="_blank">
                {website.displayUrl}
              </a>
            </Link>
          )}
        </div>
      </div>
      <div className={cn("mt-4 text-sm italic", className)}>{description}</div>
    </>
  );
}
