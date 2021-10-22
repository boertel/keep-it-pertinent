import client from "@/redis";

interface CacheOptions {
  expiration?: number;
  params?: any;
}

class Cache {
  private _client: any;
  private _prefix: string;
  private _expiration?: number;

  static serializeKey: (...args: any[]) => string;

  constructor(prefix: string, options: CacheOptions = {}) {
    this._client = client;
    this._prefix = prefix;
    this._expiration = options.expiration;

    this.wrap = this.wrap.bind(this);
  }

  key(key: string) {
    return `${this._prefix}:${key}`;
  }

  wrap(func: any, params = Cache.serializeKey) {
    const self: any = this;
    // shortcut to cache a function result with its arguments being the key
    const wrapped = async function (...args: any[]) {
      const key = params(args);
      let cached = await self.get(key);
      if (!cached) {
        try {
          cached = await func(...args);
        } catch (exception) {
          throw exception;
        }
        try {
          self.set(key, cached);
        } catch (exception) {
          console.error(exception);
        }
      }
      return cached;
    };

    return wrapped.bind(this);
  }

  async ttl(key: string): Promise<number> {
    return parseInt(await this._client.ttl(this.key(key)), 10);
  }

  async get(key: string) {
    return new Promise<any>((resolve, reject) => {
      this._client.get(this.key(key), (err: any, reply: string) => {
        if (err) {
          return reject(err);
        }
        if (reply) {
          return resolve(JSON.parse(reply));
        }
        return resolve(null);
      });
    });
  }

  async set(key: string, value: any, expiration?: number) {
    expiration = expiration || this._expiration;
    const _value = JSON.stringify(value);
    const _key = this.key(key);

    let chunks: string[] = [];
    const chunkSize: number = 900_000;
    let offset: number = 0;
    while (offset < _value.length) {
      chunks.push(_value.slice(offset, chunkSize + offset));
      offset = chunkSize + offset;
    }

    const pipeline = this._client.pipeline();
    const first = chunks.pop();
    if (expiration) {
      pipeline.setex(_key, expiration, first);
    } else {
      pipeline.set(_key, first);
    }
    chunks.forEach((chunk: string) => {
      pipeline.append(_key, chunk);
    });
    pipeline.exec();

    return value;
  }

  del(key: string) {
    return new Promise<number>((resolve, reject) => {
      this._client.del(this.key(key), (err: any, count: number) => {
        if (err) {
          return reject(err);
        }
        resolve(count);
      });
    });
  }
}

Cache.serializeKey = function (args: any) {
  return args
    .map((arg: any) => {
      if (typeof arg === "object") {
        return JSON.stringify(arg);
      }
      return arg;
    })
    .join(":");
};

export const cache = (key: string, options: CacheOptions) => (func: any) => {
  // decorator so we don't have to create cache instance
  // usage:
  //  cache("<my key>", { expiration: <seconds>, params: (args) => [args[0], args[1]].join(':') })(myFunctionToCache)
  const cache = new Cache(key, options);
  return cache.wrap(func, options.params);
};

export default Cache;
