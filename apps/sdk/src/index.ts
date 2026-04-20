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

  private init(): void {
    this.log('SDK Initialized', {
      experimentId: this.config.experimentId,
      userId: this.config.userId,
      sessionId: this.sessionId,
    });

    this.trackView();
    this.setupEventQueue();
  }

  private generateUserId(): string {
    let userId = localStorage.getItem('ab_test_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('ab_test_user_id', userId);
    }
    return userId;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventQueue(): void {
    setInterval(() => this.flushEvents(), 5000);
    window.addEventListener('beforeunload', () => this.flushEvents());
  }

  public trackView(): void {
    this.trackEvent('view', {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
    });
  }

  public trackConversion(properties?: Record<string, any>): void {
    this.trackEvent('conversion', {
      ...properties,
      conversionTime: Date.now(),
    });
  }

  public trackCustomEvent(eventName: string, properties?: Record<string, any>): void {
    this.trackEvent('custom', {
      eventName,
      ...properties,
    });
  }

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

    if (eventType === 'conversion') {
      this.flushEvents();
    }
  }

  public setVariant(variantId: string): void {
    this.variantId = variantId;
    this.log('Variant set', { variantId });
    localStorage.setItem(`ab_test_variant_${this.config.experimentId}`, variantId);
  }

  public getVariant(): string | null {
    if (!this.variantId) {
      this.variantId = localStorage.getItem(
        `ab_test_variant_${this.config.experimentId}`
      );
    }
    return this.variantId;
  }

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const apiUrl = `${this.config.dashboardUrl}/api/events`;
      this.log('Flushing events', { url: apiUrl, count: events.length });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          experimentId: this.config.experimentId,
          events,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.log('Events sent successfully', { response: data, count: events.length });
    } catch (error) {
      this.log('Error sending events', error);
      this.eventQueue = [...events, ...this.eventQueue];
    }
  }

  private log(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`[ABTestSDK] ${message}`, data);
    }
  }

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

// Export for browser
(window as any).ABTestSDK = ABTestSDK;

export default ABTestSDK;
export { ABTestSDK, ABTestConfig, ExperimentEvent };
