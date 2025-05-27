import { redisClient } from '../config/redis';
import { logger } from '../config/logger';

/**
 * Redis monitoring service to track cache usage and performance
 */
export class RedisMonitorService {
  private static readonly METRICS_PREFIX = 'metrics:redis:';
  private static readonly INTERVAL_MS = 60000; // 1 minute
  private static monitoringInterval: NodeJS.Timeout | null = null;

  /**
   * Start Redis monitoring
   */
  static startMonitoring(): void {
    if (this.monitoringInterval) {
      logger.warn('Redis monitoring already started');
      return;
    }

    logger.info('Starting Redis monitoring');
    
    // Collect metrics immediately
    this.collectMetrics();
    
    // Then collect at regular intervals
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, this.INTERVAL_MS);
  }

  /**
   * Stop Redis monitoring
   */
  static stopMonitoring(): void {
    if (!this.monitoringInterval) {
      logger.warn('Redis monitoring not started');
      return;
    }

    logger.info('Stopping Redis monitoring');
    clearInterval(this.monitoringInterval);
    this.monitoringInterval = null;
  }

  /**
   * Collect Redis metrics
   */
  private static async collectMetrics(): Promise<void> {
    try {
      // Get Redis info
      const info = await redisClient.info();
      
      // Parse info sections
      const sections = this.parseRedisInfo(info);
      
      // Extract and store key metrics
      const timestamp = Date.now();
      const metrics = {
        timestamp,
        memory: {
          used_memory: parseInt(sections.memory?.used_memory || '0', 10),
          used_memory_peak: parseInt(sections.memory?.used_memory_peak || '0', 10),
          used_memory_rss: parseInt(sections.memory?.used_memory_rss || '0', 10),
        },
        clients: {
          connected_clients: parseInt(sections.clients?.connected_clients || '0', 10),
          blocked_clients: parseInt(sections.clients?.blocked_clients || '0', 10),
        },
        stats: {
          total_connections_received: parseInt(sections.stats?.total_connections_received || '0', 10),
          total_commands_processed: parseInt(sections.stats?.total_commands_processed || '0', 10),
          instantaneous_ops_per_sec: parseInt(sections.stats?.instantaneous_ops_per_sec || '0', 10),
          keyspace_hits: parseInt(sections.stats?.keyspace_hits || '0', 10),
          keyspace_misses: parseInt(sections.stats?.keyspace_misses || '0', 10),
        },
      };
      
      // Store metrics in Redis
      await redisClient.hSet(
        `${this.METRICS_PREFIX}${timestamp}`,
        'data',
        JSON.stringify(metrics)
      );
      
      // Set expiry (keep metrics for 24 hours)
      await redisClient.expire(`${this.METRICS_PREFIX}${timestamp}`, 86400);
      
      // Calculate hit rate
      const hits = metrics.stats.keyspace_hits;
      const misses = metrics.stats.keyspace_misses;
      const total = hits + misses;
      const hitRate = total > 0 ? (hits / total) * 100 : 0;
      
      logger.debug(`Redis metrics collected: ${metrics.stats.instantaneous_ops_per_sec} ops/sec, ${hitRate.toFixed(2)}% hit rate`);
      
      // Clean up old metrics (keep only last 24 hours)
      this.cleanupOldMetrics(timestamp - 86400000);
    } catch (error) {
      logger.error('Error collecting Redis metrics:', error);
    }
  }

  /**
   * Parse Redis INFO command output into sections
   * @param info Redis INFO output
   * @returns Parsed sections
   */
  private static parseRedisInfo(info: string): Record<string, Record<string, string>> {
    const sections: Record<string, Record<string, string>> = {};
    let currentSection = '';
    
    info.split('\n').forEach(line => {
      // Skip empty lines and comments
      if (!line || line.startsWith('#')) {
        return;
      }
      
      // Section header
      if (line.startsWith('# ')) {
        currentSection = line.substring(2).toLowerCase();
        sections[currentSection] = {};
        return;
      }
      
      // Key-value pairs
      const parts = line.split(':');
      if (parts.length === 2 && currentSection) {
        const key = parts[0];
        const value = parts[1];
        sections[currentSection][key] = value;
      }
    });
    
    return sections;
  }

  /**
   * Clean up old metrics
   * @param cutoffTimestamp Timestamp threshold (delete older)
   */
  private static async cleanupOldMetrics(cutoffTimestamp: number): Promise<void> {
    try {
      // Find keys to delete
      let cursor = 0;
      do {
        const result = await redisClient.scan(cursor, {
          MATCH: `${this.METRICS_PREFIX}*`,
          COUNT: 100,
        });
        
        cursor = result.cursor;
        
        // Filter keys older than cutoff
        for (const key of result.keys) {
          const timestamp = parseInt(key.substring(this.METRICS_PREFIX.length), 10);
          if (timestamp < cutoffTimestamp) {
            await redisClient.del(key);
          }
        }
      } while (cursor !== 0);
    } catch (error) {
      logger.error('Error cleaning up old Redis metrics:', error);
    }
  }

  /**
   * Get Redis metrics for a time range
   * @param startTime Start timestamp
   * @param endTime End timestamp
   * @returns Array of metrics
   */
  static async getMetrics(startTime: number, endTime = Date.now()): Promise<any[]> {
    try {
      const metrics = [];
      
      // Find metrics keys in the time range
      let cursor = 0;
      do {
        const result = await redisClient.scan(cursor, {
          MATCH: `${this.METRICS_PREFIX}*`,
          COUNT: 100,
        });
        
        cursor = result.cursor;
        
        // Filter and collect metrics in range
        for (const key of result.keys) {
          const timestamp = parseInt(key.substring(this.METRICS_PREFIX.length), 10);
          if (timestamp >= startTime && timestamp <= endTime) {
            const data = await redisClient.hGet(key, 'data');
            if (data) {
              metrics.push(JSON.parse(data));
            }
          }
        }
      } while (cursor !== 0);
      
      // Sort by timestamp
      return metrics.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      logger.error('Error getting Redis metrics:', error);
      return [];
    }
  }

  /**
   * Get current Redis stats summary
   * @returns Redis stats summary
   */
  static async getStatsSummary(): Promise<Record<string, any>> {
    try {
      // Get Redis info
      const info = await redisClient.info();
      
      // Parse info sections
      const sections = this.parseRedisInfo(info);
      
      // Get memory usage
      const memoryUsed = parseInt(sections.memory?.used_memory_human || '0', 10);
      
      // Get key statistics
      const keyspaceHits = parseInt(sections.stats?.keyspace_hits || '0', 10);
      const keyspaceMisses = parseInt(sections.stats?.keyspace_misses || '0', 10);
      const totalOps = parseInt(sections.stats?.total_commands_processed || '0', 10);
      const opsPerSec = parseInt(sections.stats?.instantaneous_ops_per_sec || '0', 10);
      
      // Calculate hit rate
      const totalKeyspace = keyspaceHits + keyspaceMisses;
      const hitRate = totalKeyspace > 0 ? (keyspaceHits / totalKeyspace) * 100 : 0;
      
      // Get clients
      const connectedClients = parseInt(sections.clients?.connected_clients || '0', 10);
      
      // Get overall database stats
      const databaseKeys = Object.keys(sections).filter(key => key.startsWith('keyspace'));
      const totalKeys = databaseKeys.reduce((sum, db) => {
        const keysInDb = parseInt(sections[db]?.keys || '0', 10);
        return sum + keysInDb;
      }, 0);
      
      return {
        timestamp: Date.now(),
        memoryUsed,
        connectedClients,
        totalKeys,
        keyspaceHits,
        keyspaceMisses,
        hitRate: hitRate.toFixed(2),
        totalOps,
        opsPerSec,
        uptime: parseInt(sections.server?.uptime_in_seconds || '0', 10),
      };
    } catch (error) {
      logger.error('Error getting Redis stats summary:', error);
      return {};
    }
  }
}