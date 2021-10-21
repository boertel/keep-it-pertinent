// @ts-nocheck
import { forwardRef } from "react";
import cn from "classnames";
import Avatar from "./Avatar";
import Author from "./Author";
import Datetime from "./Datetime";
import Link from "./Link";

interface AuthorType {
  id: number;
  name: string;
  username: string;
  avatar?: string;
}

interface TweetProps {
  author?: AuthorType;
  text: string;
  createdAt: string;
  id: number;
  retweet: any;
  className?: string;
  media: any;
  isRetweet: boolean;
  as: any;
}

const Tweet = forwardRef(function MyTweet(
  {
    author,
    className,
    text,
    createdAt,
    id,
    retweet,
    isRetweet,
    media = [],
    as: AsComponent = "li",
  }: TweetProps,
  ref
) {
  const href = `https://twitter.com/${author.username}/status/${id}`;
  return (
    <AsComponent
      key={id}
      className={cn("flex py-4", className)}
      ref={ref}
      style={{ scrollMarginTop: "20px" }}
    >
      <Avatar
        src={author.avatar}
        className={cn("mr-4 border-gray-400", {
          "border-none w-8 h-8 mr-2": isRetweet,
        })}
      />
      <div className="flex flex-col flex-grow">
        <div
          className="flex items-center justify-between flex-wrap"
          style={{ columnGap: "8px" }}
        >
          <Author
            name={author.name}
            username={author.username}
            className="items-center"
          />
          {createdAt && (
            <Datetime
              className="text-sm text-gray-500"
              as={Link}
              href={href}
              target="_blank"
            >
              {createdAt}
            </Datetime>
          )}
        </div>
        <div className="space-y-2">
          <p dangerouslySetInnerHTML={{ __html: text }} />
          {retweet && <Tweet as="blockquote" {...retweet} isRetweet={true} />}
          {media.length > 0 && (
            <div className="mt-12" style={{ height: "250px" }}>
              <div className="absolute left-0 right-0">
                <div className="flex justify-center space-x-4 overflow-y-scroll px-4 pb-3">
                  {media.map(({ id, url }) => (
                    <Media key={id} url={url} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AsComponent>
  );
});

export default Tweet;

function Media({ url }: { url: string }) {
  return (
    <img
      src={url}
      className="rounded-lg object-contain"
      style={{ height: "250px" }}
    />
  );
}
