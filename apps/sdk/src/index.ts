/**
 * A/B Testing Dashboard SDK
 * Lightweight JavaScript library for tracking A/B test events
 */

interface ABTestConfig {
  dashboardUrl: string;
  experimentId: string;
  userId?: string;
  debug?: boolean;
}

interface ExperimentEvent {
  experimentId: string;
  userId: string;
  variantId: string;
  eventType: 'view' | 'conversion' | 'custom';
  properties?: Record<string, any>;
  timestamp: string;
}

class ABTestSDK {
  private config: ABTestConfig;
  private sessionId: string;
  private variantId: string | null = null;
  private eventQueue: ExperimentEvent[] = [];

  constructor(config: ABTestConfig) {
    if (!config.dashboardUrl || !config.experimentId) {
      throw new Error('dashboardUrl and experimentId are required');
    }

    this.config = {
      ...config,
      debug: config.debug || false,
      userId: config.userId || this.generateUserId(),
    };

    this.sessionId = this.generateSessionId();
    this.init();
  }

  /**
   * Initialize the SDK
   */
  private init(): void {
    this.log('SDK Initialized', {
      experimentId: this.config.experimentId,
      userId: this.config.userId,
      sessionId: this.sessionId,
    });

    // Track page view
    this.trackView();

    // Set up automatic event sending
    this.setupEventQueue();
  }

  /**
   * Generate unique user ID
   */
  private generateUserId(): string {
    let userId = localStorage.getItem('ab_test_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('ab_test_user_id', userId);
    }
    return userId;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set up automatic event queue processing
   */
  private setupEventQueue(): void {
    // Send events every 5 seconds or when page unloads
    setInterval(() => this.flushEvents(), 5000);
    window.addEventListener('beforeunload', () => this.flushEvents());
  }

  /**
   * Track page view
   */
  public trackView(): void {
    this.trackEvent('view', {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
    });
  }

  /**
   * Track conversion event
   */
  public trackConversion(properties?: Record<string, any>): void {
    this.trackEvent('conversion', {
      ...properties,
      conversionTime: Date.now(),
    });
  }

  /**
   * Track custom event
   */
  public trackCustomEvent(eventName: string, properties?: Record<string, any>): void {
    this.trackEvent('custom', {
      eventName,
      ...properties,
    });
  }

  /**
   * Track generic event
   */
  private trackEvent(
    eventType: 'view' | 'conversion' | 'custom',
    properties?: Record<string, any>
  ): void {
    const event: ExperimentEvent = {
      experimentId: this.config.experimentId,
      userId: this.config.userId!,
      variantId: this.variantId || 'unknown',
      eventType,
      properties,
      timestamp: new Date().toISOString(),
    };

    this.eventQueue.push(event);
    this.log(`Event tracked: ${eventType}`, event);

    // Flush immediately for conversions
    if (eventType === 'conversion') {
      this.flushEvents();
    }
  }

  /**
   * Set variant ID for the user
   */
  public setVariant(variantId: string): void {
    this.variantId = variantId;
    this.log('Variant set', { variantId });
    
    // Store in localStorage for persistence
    localStorage.setItem(`ab_test_variant_${this.config.experimentId}`, variantId);
  }

  /**
   * Get current variant ID
   */
  public getVariant(): string | null {
    if (!this.variantId) {
      this.variantId = localStorage.getItem(
        `ab_test_variant_${this.config.experimentId}`
      );
    }
    return this.variantId;
  }

  /**
   * Send events to dashboard
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch(
        `${this.config.dashboardUrl}/api/events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            experimentId: this.config.experimentId,
            events,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.log('Events sent successfully', { count: events.length });
    } catch (error) {
      this.log('Error sending events', error);
      // Re-queue failed events
      this.eventQueue = [...events, ...this.eventQueue];
    }
  }

  /**
   * Logging utility
   */
  private log(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`[ABTestSDK] ${message}`, data);
    }
  }

  /**
   * Get SDK info
   */
  public getInfo(): {
    version: string;
    experimentId: string;
    userId: string;
    sessionId: string;
    variant: string | null;
  } {
    return {
      version: '1.0.0',
      experimentId: this.config.experimentId,
      userId: this.config.userId!,
      sessionId: this.sessionId,
      variant: this.variantId,
    };
  }
}

// Export for use in browser
if (typeof window !== 'undefined') {
  (window as any).ABTestSDK = ABTestSDK;
}

export default ABTestSDK;
export { ABTestSDK, ABTestConfig, ExperimentEvent };
