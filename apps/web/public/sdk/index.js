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
        init() {
            this.log('SDK Initialized', {
                experimentId: this.config.experimentId,
                userId: this.config.userId,
                sessionId: this.sessionId,
            });
            this.trackView();
            this.setupEventQueue();
        }
        generateUserId() {
            let userId = localStorage.getItem('ab_test_user_id');
            if (!userId) {
                userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem('ab_test_user_id', userId);
            }
            return userId;
        }
        generateSessionId() {
            return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        setupEventQueue() {
            setInterval(() => this.flushEvents(), 5000);
            window.addEventListener('beforeunload', () => this.flushEvents());
        }
        trackView() {
            this.trackEvent('view', {
                url: window.location.href,
                title: document.title,
                referrer: document.referrer,
            });
        }
        trackConversion(properties) {
            this.trackEvent('conversion', Object.assign(Object.assign({}, properties), { conversionTime: Date.now() }));
        }
        trackCustomEvent(eventName, properties) {
            this.trackEvent('custom', Object.assign({ eventName }, properties));
        }
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
            if (eventType === 'conversion') {
                this.flushEvents();
            }
        }
        setVariant(variantId) {
            this.variantId = variantId;
            this.log('Variant set', { variantId });
            localStorage.setItem(`ab_test_variant_${this.config.experimentId}`, variantId);
        }
        getVariant() {
            if (!this.variantId) {
                this.variantId = localStorage.getItem(`ab_test_variant_${this.config.experimentId}`);
            }
            return this.variantId;
        }
        flushEvents() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.eventQueue.length === 0)
                    return;
                const events = [...this.eventQueue];
                this.eventQueue = [];
                try {
                    const apiUrl = `${this.config.dashboardUrl}/api/events`;
                    this.log('Flushing events', { url: apiUrl, count: events.length });
                    const response = yield fetch(apiUrl, {
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
                    const data = yield response.json();
                    this.log('Events sent successfully', { response: data, count: events.length });
                }
                catch (error) {
                    this.log('Error sending events', error);
                    this.eventQueue = [...events, ...this.eventQueue];
                }
            });
        }
        log(message, data) {
            if (this.config.debug) {
                console.log(`[ABTestSDK] ${message}`, data);
            }
        }
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
    // Export for browser
    window.ABTestSDK = ABTestSDK;
    exports.default = ABTestSDK;
});
