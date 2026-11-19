const Redis = require("ioredis");

// Configuration from environment variables
const REDIS_URL = process.env.REDIS_URL || process.env.REDIS_URI;
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT, 10) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

// In-Memory cache fallback store (Map with TTL)
// Guarantees fast caching even if Redis server is not currently running locally!
const memoryCache = new Map();

let redis = null;
let isRedisConnected = false;
let hasLoggedFailure = false;

// Initialize Redis client safely without crashing Express
try {
    const redisOptions = {
        maxRetriesPerRequest: 1,
        retryStrategy(times) {
            if (times > 3) {
                // If offline, retry only every 60 seconds
                return 60000;
            }
            return Math.min(times * 1000, 3000);
        },
        connectTimeout: 3000,
        enableOfflineQueue: false,
        lazyConnect: true // Don't block application startup
    };

    if (REDIS_URL) {
        redis = new Redis(REDIS_URL, redisOptions);
    } else {
        redis = new Redis({
            host: REDIS_HOST,
            port: REDIS_PORT,
            password: REDIS_PASSWORD,
            ...redisOptions
        });
    }

    redis.on("connect", () => {
        isRedisConnected = true;
        console.log(`[Redis] Connected successfully to ${REDIS_URL ? "Cloud Redis" : `${REDIS_HOST}:${REDIS_PORT}`}`);
    });

    redis.on("ready", () => {
        isRedisConnected = true;
    });

    redis.on("error", (err) => {
        isRedisConnected = false;
        if (!hasLoggedFailure) {
            hasLoggedFailure = true;
            console.warn(`[Redis] Not reachable (${err.message}). Seamlessly using fast In-Memory Cache fallback. (App running normally)`);
        }
    });

    redis.on("close", () => {
        isRedisConnected = false;
    });

    // Attempt initial non-blocking connection
    redis.connect().catch((err) => {
        isRedisConnected = false;
        if (!hasLoggedFailure) {
            hasLoggedFailure = true;
            console.warn(`[Redis] Initial connection skipped: ${err.message}. Using In-Memory Cache fallback.`);
        }
    });
} catch (error) {
    isRedisConnected = false;
    console.warn(`[Redis] Init warning: ${error.message}. In-Memory fallback active.`);
}

/**
 * Get item from cache (Redis with In-Memory fallback)
 */
async function getCache(key) {
    try {
        if (isRedisConnected && redis) {
            const raw = await redis.get(key);
            if (raw) return JSON.parse(raw);
        }
    } catch (err) {
        // Fall through to memoryCache on redis error
    }

    // In-memory fallback check
    const item = memoryCache.get(key);
    if (item) {
        if (Date.now() > item.expiresAt) {
            memoryCache.delete(key);
            return null;
        }
        return item.value;
    }
    return null;
}

/**
 * Set item in cache with TTL in seconds (default: 60s)
 */
async function setCache(key, value, ttlSeconds = 60) {
    // Save to memory cache as immediate fallback
    memoryCache.set(key, {
        value,
        expiresAt: Date.now() + (ttlSeconds * 1000)
    });

    try {
        if (isRedisConnected && redis) {
            const serialized = JSON.stringify(value);
            await redis.set(key, serialized, "EX", ttlSeconds);
        }
    } catch (err) {
        // Safe to ignore if redis is offline
    }
}

/**
 * Delete a specific key
 */
async function delCache(key) {
    memoryCache.delete(key);
    try {
        if (isRedisConnected && redis) {
            await redis.del(key);
        }
    } catch (err) {}
}

/**
 * Invalidate all keys matching a pattern
 * Example pattern: 'dashboard:*'
 */
async function invalidatePattern(pattern) {
    // 1. Invalidate matching in-memory cache keys
    const regexPattern = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    for (const k of memoryCache.keys()) {
        if (regexPattern.test(k)) {
            memoryCache.delete(k);
        }
    }

    // 2. Invalidate in Redis
    try {
        if (isRedisConnected && redis) {
            let cursor = "0";
            do {
                const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
                cursor = nextCursor;
                if (keys && keys.length > 0) {
                    await redis.del(...keys);
                }
            } while (cursor !== "0");
        }
    } catch (err) {
        // Safe ignore
    }
}

/**
 * Helper to invalidate all dashboard-related caches
 */
async function invalidateDashboardCache(hotelId = null) {
    try {
        // Invalidate all dashboard metrics across roles
        await invalidatePattern("dashboard:*");
    } catch (err) {
        console.error("[Redis] Invalidate error:", err);
    }
}

module.exports = {
    redis,
    isRedisConnected: () => isRedisConnected,
    getCache,
    setCache,
    delCache,
    invalidatePattern,
    invalidateDashboardCache
};
