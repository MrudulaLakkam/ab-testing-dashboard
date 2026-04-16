# A/B Testing SDK

Lightweight JavaScript SDK for tracking A/B test events.

## Installation

### Via NPM (Coming Soon)
```bash
npm install @ab-testing/sdk
```

### Via Script Tag
```html
<script src="https://ab-testing-dashboard-web.vercel.app/sdk/index.js"></script>
```

## Usage

### Basic Setup
```javascript
const abtest = new ABTestSDK({
  dashboardUrl: 'https://ab-testing-dashboard-web.vercel.app',
  experimentId: 'button-color-test',
  userId: 'user-123', // Optional
  debug: true // Optional
});
```

### Set Variant
```javascript
// Assign user to variant A or B
abtest.setVariant('variant-a');
```

### Track Events
```javascript
// Track page view (automatic)
abtest.trackView();

// Track conversion
abtest.trackConversion({
  value: 99.99,
  currency: 'USD'
});

// Track custom event
abtest.trackCustomEvent('button-clicked', {
  buttonId: 'cta-button',
  page: 'homepage'
});
```

### Get Variant
```javascript
const variant = abtest.getVariant();
console.log(variant); // 'variant-a'
```

### Get SDK Info
```javascript
const info = abtest.getInfo();
// {
//   version: '1.0.0',
//   experimentId: 'button-color-test',
//   userId: 'user-123',
//   sessionId: 'session_...',
//   variant: 'variant-a'
// }
```

## Features

✅ Lightweight (~2KB gzipped)
✅ Automatic session tracking
✅ Event queuing and batching
✅ Persistent user identification
✅ No dependencies
✅ TypeScript support
✅ Debug mode

## API

### Constructor
```typescript
new ABTestSDK(config: ABTestConfig)
```

### Methods
- `trackView()` - Track page view
- `trackConversion(properties?)` - Track conversion
- `trackCustomEvent(name, properties?)` - Track custom event
- `setVariant(variantId)` - Set user variant
- `getVariant()` - Get current variant
- `getInfo()` - Get SDK information

## License
MIT
