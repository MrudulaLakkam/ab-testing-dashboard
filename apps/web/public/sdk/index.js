/**
 * A/B Testing Dashboard SDK
 * Lightweight JavaScript library for tracking A/B test events
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ABTestSDK = void 0;
    class ABTestSDK {
        constructor(config) {
            this.variantId = null;
            this.eventQueue = [];
            if (!config.dashboardUrl || !config.experimentId) {
                throw new Error('dashboardUrl and experimentId are required');
            }
            this.config = Object.assign(Object.assign({}, config), { debug: config.debug || false, userId: config.userId || this.generateUserId() });
            this.sessionId = this.generateSessionId();
            this.init();
        }
        /**
         * Initialize the SDK
         */
        init() {
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
        generateUserId() {
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
        generateSessionId() {
            return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        /**
         * Set up automatic event queue processing
         */
        setupEventQueue() {
            // Send events every 5 seconds or when page unloads
            setInterval(() => this.flushEvents(), 5000);
            window.addEventListener('beforeunload', () => this.flushEvents());
        }
        /**
         * Track page view
         */
        trackView() {
            this.trackEvent('view', {
                url: window.location.href,
                title: document.title,
                referrer: document.referrer,
            });
        }
        /**
         * Track conversion event
         */
        trackConversion(properties) {
            this.trackEvent('conversion', Object.assign(Object.assign({}, properties), { conversionTime: Date.now() }));
        }
        /**
         * Track custom event
         */
        trackCustomEvent(eventName, properties) {
            this.trackEvent('custom', Object.assign({ eventName }, properties));
        }
        /**
         * Track generic event
         */
        trackEvent(eventType, properties) {
            const event = {
                experimentId: this.config.experimentId,
                userId: this.config.userId,
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
        setVariant(variantId) {
            this.variantId = variantId;
            this.log('Variant set', { variantId });
            // Store in localStorage for persistence
            localStorage.setItem(`ab_test_variant_${this.config.experimentId}`, variantId);
        }
        /**
         * Get current variant ID
         */
        getVariant() {
            if (!this.variantId) {
                this.variantId = localStorage.getItem(`ab_test_variant_${this.config.experimentId}`);
            }
            return this.variantId;
        }
        /**
         * Send events to dashboard
         */
        flushEvents() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.eventQueue.length === 0)
                    return;
                const events = [...this.eventQueue];
                this.eventQueue = [];
                try {
                    const response = yield fetch(`${this.config.dashboardUrl}/api/events`, {
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
                    this.log('Events sent successfully', { count: events.length });
                }
                catch (error) {
                    this.log('Error sending events', error);
                    // Re-queue failed events
                    this.eventQueue = [...events, ...this.eventQueue];
                }
            });
        }
        /**
         * Logging utility
         */
        log(message, data) {
            if (this.config.debug) {
                console.log(`[ABTestSDK] ${message}`, data);
            }
        }
        /**
         * Get SDK info
         */
        getInfo() {
            return {
                version: '1.0.0',
                experimentId: this.config.experimentId,
                userId: this.config.userId,
                sessionId: this.sessionId,
                variant: this.variantId,
            };
        }
    }
    exports.ABTestSDK = ABTestSDK;
    // Export for use in browser
    if (typeof window !== 'undefined') {
        window.ABTestSDK = ABTestSDK;
    }
    exports.default = ABTestSDK;
});
