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
    private init;
    private generateUserId;
    private generateSessionId;
    private setupEventQueue;
    trackView(): void;
    trackConversion(properties?: Record<string, any>): void;
    trackCustomEvent(eventName: string, properties?: Record<string, any>): void;
    private trackEvent;
    setVariant(variantId: string): void;
    getVariant(): string | null;
    private flushEvents;
    private log;
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
