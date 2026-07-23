'use strict';
const Redis = require('ioredis');
const config = require('./env');

let redis = null;

const createRedisClient = () => {
  try {
    const client = new Redis(config.redis.url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });

    client.on('connect', () => console.log('🔴 Redis connected'));
    client.on('error', (err) => {
      console.warn('⚠️  Redis error – caching disabled:', err.message);
    });

    return client;
  } catch {
    console.warn('⚠️  Redis unavailable – caching disabled');
    return null;
  }
};

const getRedis = () => {
  if (!redis) redis = createRedisClient();
  return redis;
};

/** Safe get – returns null if Redis is down */
const cacheGet = async (key) => {
  try {
    const r = getRedis();
    if (!r) return null;
    return await r.get(key);
  } catch {
    return null;
  }
};

/** Safe set with TTL in seconds */
const cacheSet = async (key, value, ttlSeconds = 300) => {
  try {
    const r = getRedis();
    if (!r) return;
    await r.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    /* silent */
  }
};

/** Safe delete */
const cacheDel = async (key) => {
  try {
    const r = getRedis();
    if (!r) return;
    await r.del(key);
  } catch {
    /* silent */
  }
};

/** Delete by pattern (e.g. 'courses:*') */
const cacheDelPattern = async (pattern) => {
  try {
    const r = getRedis();
    if (!r) return;
    const keys = await r.keys(pattern);
    if (keys.length) await r.del(...keys);
  } catch {
    /* silent */
  }
};

module.exports = { getRedis, cacheGet, cacheSet, cacheDel, cacheDelPattern };
