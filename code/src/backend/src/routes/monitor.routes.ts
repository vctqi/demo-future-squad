import { Router, Request, Response } from 'express';
import { RedisMonitorService } from '../services/redis-monitor.service';
import { logger } from '../config/logger';

const router = Router();

/**
 * @route GET /api/monitor/redis
 * @desc Get Redis monitoring data
 * @access Admin only
 */
router.get('/redis', async (req: Request, res: Response) => {
  try {
    // Get time range from query params or use defaults
    const endTime = Date.now();
    const startTime = parseInt(req.query.since as string) || (endTime - 3600000); // Last hour by default
    
    // Get Redis stats summary
    const summary = await RedisMonitorService.getStatsSummary();
    
    // Get detailed metrics if requested
    let metrics = [];
    if (req.query.detailed === 'true') {
      metrics = await RedisMonitorService.getMetrics(startTime, endTime);
    }
    
    res.json({
      summary,
      metrics: req.query.detailed === 'true' ? metrics : undefined,
      range: {
        start: new Date(startTime).toISOString(),
        end: new Date(endTime).toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error in Redis monitor endpoint:', error);
    res.status(500).json({ error: 'Failed to get Redis monitoring data' });
  }
});

/**
 * @route POST /api/monitor/redis/start
 * @desc Start Redis monitoring
 * @access Admin only
 */
router.post('/redis/start', (req: Request, res: Response) => {
  try {
    RedisMonitorService.startMonitoring();
    res.json({ message: 'Redis monitoring started' });
  } catch (error) {
    logger.error('Error starting Redis monitoring:', error);
    res.status(500).json({ error: 'Failed to start Redis monitoring' });
  }
});

/**
 * @route POST /api/monitor/redis/stop
 * @desc Stop Redis monitoring
 * @access Admin only
 */
router.post('/redis/stop', (req: Request, res: Response) => {
  try {
    RedisMonitorService.stopMonitoring();
    res.json({ message: 'Redis monitoring stopped' });
  } catch (error) {
    logger.error('Error stopping Redis monitoring:', error);
    res.status(500).json({ error: 'Failed to stop Redis monitoring' });
  }
});

export default router;