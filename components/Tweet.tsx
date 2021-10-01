import { forwardRef } from "react";
import cn from "classnames";
import tweets from "twitter-text";
import Avatar from "./Avatar";
import Author from "./Author";
import Datetime from "./Datetime";

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
  referencedTweets: any;
  includes: any;
  attachments: any;
  entities: any;
  className?: string;
  as: any;
}

function augment(text, entities, referenceType) {
  if (entities) {
    text = tweets.autoLink(text, { urlEntities: entities.urls });
  }
  return text;
}

const Tweet = forwardRef(
  (
    {
      author,
      className,
      text,
      createdAt,
      id,
      referencedTweets,
      includes,
      attachments,
      entities,
      as: AsComponent = "li",
    }: TweetProps,
    ref
  ) => {
    let reference = null;
    let referenceType = null;
    if (referencedTweets?.length === 1) {
      reference = referencedTweets?.map(({ id, type }) => {
        referenceType = type;
        const tweet = includes.tweets[id];
        const author = includes.users[tweet.author_id];
        return (
          <Tweet
            className="pl-3 border-l-4 border-gray-700 pt-0 pb-0"
            key={id}
            id={id}
            text={augment(tweet.text, entities, referenceType)}
            author={author}
            createdAt={tweet.created_at}
            as="blockquote"
          />
        );
      });
    } else if (referencedTweets?.length > 1) {
      console.warn(id, referencedTweets);
      reference = (
        <div className="text-red-400">
          ❌ Referenced tweet no supported. Check out dev tools console for more
          details.
        </div>
      );
    }

    let media = [];
    if (attachments?.media_keys.length > 0) {
      media = attachments?.media_keys.map((media_key) => {
        return includes.media[media_key];
      });
    }

    return (
      <AsComponent
        key={id}
        className={cn("flex py-4", className)}
        ref={ref}
        style={{ scrollMarginTop: "20px" }}
      >
        <Avatar src={author.avatar} className="mr-4" />
        <div className="flex flex-col flex-grow">
          {referenceType !== "retweeted" && author && (
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
                <Datetime className="text-sm text-gray-500">
                  {createdAt}
                </Datetime>
              )}
            </div>
          )}
          <div className="space-y-2">
            {referenceType !== "retweeted" && (
              <p
                dangerouslySetInnerHTML={{
                  __html: augment(text, entities, referenceType),
                }}
              />
            )}
            {reference}
            {media.length > 0 && (
              <div className="mt-12" style={{ height: "250px" }}>
                <div className="absolute left-0 right-0">
                  <div className="flex justify-center space-x-4 overflow-y-scroll px-4 pb-3">
                    {media.map(
                      ({ url, height, media_key, type, preview_image_url }) => (
                        <Media
                          key={media_key}
                          url={preview_image_url || url}
                          height={height}
                          type={type}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </AsComponent>
    );
  }
);

export default Tweet;

enum MediaType {
  Photo = "photo",
  Video = "video",
}

function Media({
  url,
  height,
  type,
}: {
  url: string;
  height: number;
  type: MediaType;
}) {
  if (true) {
    return (
      <img
        src={url}
        className="rounded-lg object-contain"
        style={{ height: "250px" }}
      />
    );
  } else if (type === MediaType.Video) {
    return (
      <video
        src={url}
        className="rounded-lg object-contain"
        style={{ height: "250px" }}
      />
    );
  }
  return null;
}
