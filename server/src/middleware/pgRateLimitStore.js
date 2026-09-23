/**
 * Postgres Rate Limit Store
 *
 * express-rate-limit Store backed by rateLimitRepository, so every serverless
 * instance counts against the same rate_limit_hits rows. Each limiter gets its
 * own instance and prefix; the prefix is applied here, once, and the
 * repository stores the key as given.
 *
 * Fails open: a database error is logged (message only, never the key, which
 * embeds the client IP) and the request is counted as a first hit, so an
 * outage of the counter table never takes the API down with it.
 */
import * as rateLimitRepository from "../repositories/rateLimitRepository.js";

function toClientInfo(hit) {
  return { totalHits: hit.hits, resetTime: new Date(hit.resetAt) };
}

export default class PgRateLimitStore {
  constructor({ prefix = "" } = {}) {
    this.prefix = prefix;
    this.windowMs = 0;
  }

  init(options) {
    this.windowMs = options.windowMs;
  }

  prefixKey(key) {
    return `${this.prefix}${key}`;
  }

  async increment(key) {
    try {
      const hit = await rateLimitRepository.incrementHit(
        this.prefixKey(key),
        this.windowMs,
      );
      return toClientInfo(hit);
    } catch (error) {
      console.error("pgRateLimitStore.increment failed:", error.message);
      return {
        totalHits: 1,
        resetTime: new Date(Date.now() + this.windowMs),
      };
    }
  }

  async get(key) {
    try {
      const hit = await rateLimitRepository.getHit(this.prefixKey(key));
      return hit ? toClientInfo(hit) : undefined;
    } catch (error) {
      console.error("pgRateLimitStore.get failed:", error.message);
      return undefined;
    }
  }

  async decrement(key) {
    try {
      await rateLimitRepository.decrementHit(this.prefixKey(key));
    } catch (error) {
      console.error("pgRateLimitStore.decrement failed:", error.message);
    }
  }

  async resetKey(key) {
    try {
      await rateLimitRepository.resetKey(this.prefixKey(key));
    } catch (error) {
      console.error("pgRateLimitStore.resetKey failed:", error.message);
    }
  }
}
