/**
 * A/B Testing Dashboard SDK
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
class ABTestSDK {
    constructor(config) {
        this.variantId = null;
        this.eventQueue = [];
        this.config = Object.assign(Object.assign({}, config), { debug: config.debug || false, userId: config.userId || this.generateUserId() });
        this.sessionId = this.generateSessionId();
        this.init();
    }
    init() {
        this.log('SDK Initialized', this.config);
        this.trackView();
        setInterval(() => this.flushEvents(), 5000);
        window.addEventListener('beforeunload', () => this.flushEvents());
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
    trackView() {
        this.trackEvent('view', { url: window.location.href, title: document.title });
    }
    trackConversion(properties) {
        this.trackEvent('conversion', Object.assign({}, properties));
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
        this.log(`Event: ${eventType}`, event);
        if (eventType === 'conversion')
            this.flushEvents();
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
                const response = yield fetch(`${this.config.dashboardUrl}/api/events`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ experimentId: this.config.experimentId, events }),
                });
                const data = yield response.json();
                this.log('Events sent', data);
            }
            catch (error) {
                this.log('Error', error);
                this.eventQueue = [...events, ...this.eventQueue];
            }
        });
    }
    log(msg, data) {
        if (this.config.debug)
            console.log(`[ABTestSDK] ${msg}`, data);
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
// Expose to global scope
window.ABTestSDK = ABTestSDK;
