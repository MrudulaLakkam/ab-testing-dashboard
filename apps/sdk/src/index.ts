/**
 * A/B Testing Dashboard SDK
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
  config: ABTestConfig;
  sessionId: string;
  variantId: string | null = null;
  eventQueue: ExperimentEvent[] = [];

  constructor(config: ABTestConfig) {
    this.config = { ...config, debug: config.debug || false, userId: config.userId || this.generateUserId() };
    this.sessionId = this.generateSessionId();
    this.init();
  }

  private init(): void {
    this.log('SDK Initialized', this.config);
    this.trackView();
    setInterval(() => this.flushEvents(), 5000);
    window.addEventListener('beforeunload', () => this.flushEvents());
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

  public trackView(): void {
    this.trackEvent('view', { url: window.location.href, title: document.title });
  }

  public trackConversion(properties?: Record<string, any>): void {
    this.trackEvent('conversion', { ...properties });
  }

  public trackCustomEvent(eventName: string, properties?: Record<string, any>): void {
    this.trackEvent('custom', { eventName, ...properties });
  }

  private trackEvent(eventType: 'view' | 'conversion' | 'custom', properties?: Record<string, any>): void {
    const event: ExperimentEvent = {
      experimentId: this.config.experimentId,
      userId: this.config.userId!,
      variantId: this.variantId || 'unknown',
      eventType,
      properties,
      timestamp: new Date().toISOString(),
    };
    this.eventQueue.push(event);
    this.log(`Event: ${eventType}`, event);
    if (eventType === 'conversion') this.flushEvents();
  }

  public setVariant(variantId: string): void {
    this.variantId = variantId;
    this.log('Variant set', { variantId });
    localStorage.setItem(`ab_test_variant_${this.config.experimentId}`, variantId);
  }

  public getVariant(): string | null {
    if (!this.variantId) {
      this.variantId = localStorage.getItem(`ab_test_variant_${this.config.experimentId}`);
    }
    return this.variantId;
  }

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;
    const events = [...this.eventQueue];
    this.eventQueue = [];
    try {
      const response = await fetch(`${this.config.dashboardUrl}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experimentId: this.config.experimentId, events }),
      });
      const data = await response.json();
      this.log('Events sent', data);
    } catch (error) {
      this.log('Error', error);
      this.eventQueue = [...events, ...this.eventQueue];
    }
  }

  private log(msg: string, data?: any): void {
    if (this.config.debug) console.log(`[ABTestSDK] ${msg}`, data);
  }

  public getInfo() {
    return {
      version: '1.0.0',
      experimentId: this.config.experimentId,
      userId: this.config.userId,
      sessionId: this.sessionId,
      variant: this.variantId,
    };
  }
}

// Expose to global scope
(window as any).ABTestSDK = ABTestSDK;