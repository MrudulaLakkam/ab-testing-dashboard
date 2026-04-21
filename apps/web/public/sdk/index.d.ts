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
declare class ABTestSDK {
    config: ABTestConfig;
    sessionId: string;
    variantId: string | null;
    eventQueue: ExperimentEvent[];
    constructor(config: ABTestConfig);
    private init;
    private generateUserId;
    private generateSessionId;
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
        variant: string;
    };
}
