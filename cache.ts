import client from "@/redis";

interface CacheOptions {
  expiration?: number;
  params?: any;
}

class Cache {
  _client: any;
  _prefix: string;
  _expiration?: number;

  constructor(prefix: string, options: CacheOptions = {}) {
    this._client = client;
    this._prefix = prefix;
    this._expiration = options.expiration;
  }

  key(key: string) {
    return `${this._prefix}:${key}`;
  }

  wrap(func, params = Cache.serializeKey) {
    // shortcut to cache a function result with its arguments being the key
    const wrapped = async function () {
      const args = Array.from(arguments);
      const key = params(args);
      let cached = await this.get(key);
      if (!cached) {
        try {
          cached = await func.apply(this, args);
        } catch (exception) {
          throw exception;
        }
        try {
          this.set(key, cached);
        } catch (exception) {
          console.error(exception);
        }
      }
      return cached;
    };

    return wrapped.bind(this);
  }

  async get(key: string) {
    return new Promise((resolve, reject) => {
      this._client.get(this.key(key), (err, reply) => {
        if (err) {
          return reject(err);
        }
        if (reply) {
          return resolve(JSON.parse(reply));
        }
        return resolve();
      });
    });
  }

  async set(key: string, value: any, expiration?: number) {
    expiration = expiration || this._expiration;
    const _value = JSON.stringify(value);
    const _key = this.key(key);
    if (expiration) {
      this._client.setex(_key, expiration, _value);
    } else {
      return this._client.set(_key, _value);
    }
    return value;
  }

  del(key: string) {
    return new Promise((resolve, reject) => {
      this._client.del(this.key(key), (err, count) => {
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

export const cache = (key: string, options: CacheOptions) => (func) => {
  // decorator so we don't have to create cache instance
  // usage:
  //  cache("<my key>", { expiration: <seconds>, params: (args) => [args[0], args[1]].join(':') })(myFunctionToCache)
  const cache = new Cache(key, options);
  return cache.wrap(func, options.params);
};

export default Cache;
