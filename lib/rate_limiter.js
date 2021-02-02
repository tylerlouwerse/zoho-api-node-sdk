"use strict";

/**
 * A simple, promise-based throttling system; not quite a token bucket. Will not
 * allow more than throttleMax transactions to occur within throttlePeriod
 * seconds. Bursting beyond the limit is not allowed; tokens are valid
 * immediately upon creation, so if you create an instance with 10 tokens and
 * put through 11 requests, the first 10 will fire off immediately, and the 11th
 * will wait nearly the entirety of throttlePeriod.
 *
 * Use like so:
 *
 *   const rl = new RateLimiter(10, 60);  // allow up to 10 transactions in any
 *                                        // 60 second period of time
 *
 *   rl.throttle(() => "hey!")            // supply a function to #throttle()
 *     .then(res => console.log(res));    // and handle the resulting promise
 */

class RateLimiter {
  constructor(throttleMax, throttlePeriod) {
    if ((typeof throttleMax != 'number') ||
         (typeof throttlePeriod != 'number'))
      throw new TypeError("All arguments must be natural numbers.");

    throttleMax = parseInt(throttleMax, 10);
    throttlePeriod = parseInt(throttlePeriod, 10);

    if ((throttleMax < 1) || (throttlePeriod < 1))
      throw new RangeError("All arguments must be natural numbers.");

    this.max = throttleMax;
    this.period = throttlePeriod;

    let readyTs = Date.now();

    this.nextToken = Token.ring(throttleMax, readyTs);
  }  // constructor()

  throttle(f) {
    return new Promise((resolve, reject) => {
      const wrap = () => {
        try {
          resolve(f());
        } catch (e) {
          reject(e);
        }
      }

      const delay = Math.max(0, this.nextToken.readyAt - Date.now());

      if (delay)
        setTimeout(wrap, delay);
      else
        wrap();

      this.nextToken.readyAt = Date.now() + delay + 50 + this.period * 1000;
      this.nextToken = this.nextToken.next;
    });
  }  // throttle()
}  // class RateLimiter

class Token {
  static ring(n, readyTs) {
    let first, previous;

    for (let i = 0; i < n; i++) {
      let token = new this(readyTs);
      if (!i)
        first = previous = token;
      else
        previous = previous.next = token;
    }

    return previous.next = first;
  }  // static ring()

  constructor(ts) {
    this.readyAt = ts;
    this.next = null;
  }
}  // class Token

module.exports = RateLimiter;