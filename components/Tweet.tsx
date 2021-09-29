import Link from "./Link";
import * as dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

interface Author {
  id: number;
  name: string;
  username: string;
}

interface TweetProps {
  author?: Author
  text: string;
  createdAt: string;
  id: number;
  referencedTweets: any;
  includes: any;
  attachments: any;
  entities: any;
  className?: string;
}

function augment(text, entities, referenceType) {
  console.log(referenceType, entities)
  if (entities) {
    if (referenceType === 'quoted') {
      entities.urls.forEach(url => {
        text = text.substring(0, url.start) + text.substring(url.end, text.length - 1)
      })
    }
  }
  return text
}

export default function Tweet({author, className = 'py-6', text, createdAt, id, referencedTweets, includes, attachments, entities}) {
  let reference = null;
  let referenceType = null
  if (referencedTweets?.length === 1) {
    reference = referencedTweets?.map(({id, type}) => {
      referenceType = type
      const tweet = includes.tweets[id];
      const author = includes.users[tweet.author_id];
      return (
        <Tweet
          className="py-1 my-2"
          key={id}
          id={id}
          text={augment(tweet.text, entities, referenceType)}
          author={author}
          createdAt={tweet.created_at}
        />
      );
    });
  } else if (referencedTweets?.length > 1) {
    console.warn(referencedTweets)
    reference = <div className="text-red-400">❌ Referenced tweet no supported. Check out dev tools console for more details.</div>
  }

  let media = [];
  if (attachments?.media_keys.length > 0) {
    media = attachments?.media_keys.map(media_key => {
      return includes.media[media_key]
    })
  }

  return (
    <li key={id} className={className}>
      {referenceType !== 'retweeted' && author && <Author name={author.name} username={author.username} createdAt={createdAt} />}
      {referenceType !== 'retweeted' && augment(text, entities, referenceType).split('\n').map(t => (<>{t}<br /></>))}
      {reference && (<blockquote className="pl-4 border-l-4 border-gray-700">
        {reference}
      </blockquote>)}
      {media.length > 0 && (<div className="flex justify-center py-4">{media.map(({url, height, media_key}) => <Media key={media_key} url={url} height={height} />)}</div>)}
    </li>
  )
}


function Author({name, username, createdAt}: {name: string; username: string, createdAt: string}) {
  return (
    <h4 className="flex items-center justify-between mb-1">
      <div className="flex items-center font-bold">{name}&nbsp;<span className="text-sm font-normal text-gray-500">@{username}</span></div>
      <div className="text-sm text-gray-500">{dayjs(createdAt).fromNow()}</div>
    </h4>
  )
}

function Media({url, height}: {url: string; height: number}) {
  return (
    <img src={url} className="rounded-lg object-contain" style={{height: '250px'}} />
  )
}


