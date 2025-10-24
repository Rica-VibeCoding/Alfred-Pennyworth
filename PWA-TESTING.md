# PWA Testing Guide - Alfred

## Quick Tests

### 1. Generate Icons First
```bash
# Open in browser
open assets/icons/generate-icons.html

# Or use Node.js (if canvas installed)
cd assets/icons
node generate-icons.js
```

### 2. Local Testing

#### Option A: Python HTTP Server
```bash
python -m http.server 8000
# Visit: http://localhost:8000
```

#### Option B: Node.js http-server
```bash
npx http-server -p 8000
# Visit: http://localhost:8000
```

#### Option C: Live Server (VS Code)
Install "Live Server" extension and click "Go Live"

### 3. Run PWA Configuration Test
```
http://localhost:8000/pwa-test.html
```

This will check:
- ✅ Service Worker registration
- ✅ Manifest.json validity
- ✅ iOS meta tags
- ✅ HTTPS/secure context
- ✅ Installability

## iPhone 11 Testing (Primary Device)

### Prerequisites
1. Deploy to HTTPS (required for PWA on iOS)
2. Deploy to Vercel: `vercel deploy --prod`

### Installation Steps (iOS Safari)
1. Open app URL in Safari
2. Tap Share button (bottom center)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" (top right)
5. App icon appears on home screen

### Testing Checklist
- [ ] App loads offline (interface only)
- [ ] Icon shows correctly on home screen
- [ ] Splash screen appears on launch
- [ ] Status bar style is correct
- [ ] No Safari UI (full standalone)
- [ ] Voice recognition works
- [ ] Messages send successfully
- [ ] Scroll is smooth
- [ ] Keyboard doesn't break layout

### iOS PWA Limitations
- ❌ No push notifications
- ❌ No background sync
- ✅ Service Worker works
- ✅ Offline UI works
- ✅ Speech Recognition works
- ✅ LocalStorage works

## Desktop Testing

### Chrome/Edge (Chromium)
1. Open DevTools (F12)
2. Go to "Application" tab
3. Check "Manifest" section
4. Check "Service Workers" section
5. Run Lighthouse audit:
   - Click Lighthouse tab
   - Select "Progressive Web App"
   - Click "Generate report"

### Expected Lighthouse Scores
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90
- PWA: > 90 (installable)

## Common Issues & Fixes

### Service Worker Not Registering
- Check HTTPS (required)
- Check sw.js path is correct (`/sw.js`)
- Check console for errors
- Hard refresh: Ctrl+Shift+R

### Manifest Not Loading
- Check manifest.json is valid JSON
- Check MIME type (should be application/json)
- Verify all icon paths exist
- Check `<link rel="manifest">` in HTML

### Icons Not Showing
1. Generate icons first (see step 1)
2. Verify files exist in `/assets/icons/`
3. Check file names match manifest.json
4. Clear cache and reload

### App Not Installable (Desktop)
- Requires HTTPS (or localhost)
- Requires valid manifest.json
- Requires registered Service Worker
- Requires at least one icon (192x192 or larger)
- Must not be already installed

### App Not Installing (iOS)
- **iOS doesn't show install prompt automatically**
- User must manually "Add to Home Screen"
- Only works in Safari (not Chrome iOS)
- Requires HTTPS

## Cache Management

### Clear All Caches
```javascript
// Run in browser console
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
  console.log('All caches cleared');
  location.reload();
});
```

### Unregister Service Worker
```javascript
// Run in browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister());
  console.log('Service Worker unregistered');
  location.reload();
});
```

## Performance Validation

### Bundle Size Check
```bash
# Check total size
du -sh index.html css/ js/ manifest.json sw.js

# Should be < 100KB total
```

### Network Tab (DevTools)
- All static assets should come from Service Worker
- API calls should go to network
- No 404 errors
- No render-blocking resources

### Lighthouse Metrics
- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- Total Blocking Time: < 300ms
- Cumulative Layout Shift: < 0.1

## Deployment Checklist

Before deploying to production:
- [ ] Icons generated and placed in `/assets/icons/`
- [ ] `config.js` has correct N8N webhook URL
- [ ] `config.js` is NOT committed (use config.example.js)
- [ ] All files pass PWA test page
- [ ] Service Worker registers successfully
- [ ] Manifest loads without errors
- [ ] Lighthouse PWA score > 90
- [ ] Tested on iPhone 11 Safari
- [ ] Bundle size < 100KB
- [ ] HTTPS enabled

## Vercel Deployment

```bash
# First time
vercel deploy

# Production
vercel deploy --prod

# Custom domain (optional)
vercel domains add alfred.yourdomain.com
```

### Vercel Configuration
Create `vercel.json` (optional):
```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/json"
        }
      ]
    }
  ]
}
```

## Debug Commands

### Check Service Worker Status
```javascript
navigator.serviceWorker.getRegistration()
  .then(reg => console.log(reg))
```

### Check Cache Contents
```javascript
caches.keys()
  .then(names => console.log('Caches:', names))

caches.open('alfred-v1.0.0-static')
  .then(cache => cache.keys())
  .then(keys => console.log('Cached files:', keys.map(k => k.url)))
```

### Check Manifest
```javascript
fetch('/manifest.json')
  .then(r => r.json())
  .then(m => console.log('Manifest:', m))
```

## Resources

- [PWA Builder](https://www.pwabuilder.com/)
- [Web.dev PWA Checklist](https://web.dev/pwa-checklist/)
- [MDN Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [iOS PWA Guide](https://web.dev/apple-touch-icon/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
