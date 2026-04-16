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
declare class ABTestSDK {
    private config;
    private sessionId;
    private variantId;
    private eventQueue;
    constructor(config: ABTestConfig);
    /**
     * Initialize the SDK
     */
    private init;
    /**
     * Generate unique user ID
     */
    private generateUserId;
    /**
     * Generate unique session ID
     */
    private generateSessionId;
    /**
     * Set up automatic event queue processing
     */
    private setupEventQueue;
    /**
     * Track page view
     */
    trackView(): void;
    /**
     * Track conversion event
     */
    trackConversion(properties?: Record<string, any>): void;
    /**
     * Track custom event
     */
    trackCustomEvent(eventName: string, properties?: Record<string, any>): void;
    /**
     * Track generic event
     */
    private trackEvent;
    /**
     * Set variant ID for the user
     */
    setVariant(variantId: string): void;
    /**
     * Get current variant ID
     */
    getVariant(): string | null;
    /**
     * Send events to dashboard
     */
    private flushEvents;
    /**
     * Logging utility
     */
    private log;
    /**
     * Get SDK info
     */
    getInfo(): {
        version: string;
        experimentId: string;
        userId: string;
        sessionId: string;
        variant: string | null;
    };
}
export default ABTestSDK;
export { ABTestSDK, ABTestConfig, ExperimentEvent };
