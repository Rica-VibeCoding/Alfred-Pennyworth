# Quick Start - PWA Setup (5 Minutes)

## Step 1: Generate Icons (2 minutes)

### Option A: Browser (Easiest)
```bash
# Open in your browser
assets/icons/generate-icons.html
```

1. Click "Gerar e Baixar Todos os Ícones"
2. 10 PNG files will download automatically
3. Move all files to `assets/icons/` folder
4. Done! ✅

### Option B: Node.js (If you prefer)
```bash
cd assets/icons
npm install canvas
node generate-icons.js
```

---

## Step 2: Test Locally (1 minute)

```bash
# Start local server (choose one)
python -m http.server 8000
# OR
npx http-server -p 8000
```

Open: http://localhost:8000/pwa-test.html

**All checks should be GREEN ✅**

---

## Step 3: Deploy to Vercel (2 minutes)

```bash
# First time setup
npm i -g vercel
vercel login

# Deploy to production
vercel deploy --prod
```

Copy the production URL (e.g., `https://alfred-xxx.vercel.app`)

---

## Step 4: Install on iPhone 11

1. Open production URL in Safari
2. Tap **Share** button (bottom center)
3. Scroll down, tap **"Add to Home Screen"**
4. Tap **"Add"** (top right)
5. App appears on home screen ✅

**Launch it - it should open full screen without Safari UI!**

---

## Verification Checklist

On iPhone 11:
- [ ] App icon shows on home screen
- [ ] Opens full screen (no Safari UI)
- [ ] Can send text message
- [ ] Voice button works
- [ ] Messages appear in chat
- [ ] Scroll is smooth
- [ ] Works offline (UI loads)

---

## Troubleshooting

### Icons still showing generic image
- Verify files exist: `ls -la assets/icons/*.png`
- Should see 10 PNG files
- Re-generate if missing

### Service Worker error
- Must use HTTPS (or localhost)
- Check console for errors
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Not installable on iPhone
- Must be HTTPS (Vercel deployment)
- Must use Safari (not Chrome iOS)
- Manually add via Share > Add to Home Screen

---

## Success! 🎉

Your PWA is now:
- ✅ Installable on iPhone 11
- ✅ Works offline (UI)
- ✅ Fast (32KB bundle)
- ✅ Independent (no WhatsApp needed)

**Next:** Start using it! Send messages to your N8N assistant.

---

## Optional: Custom Domain

```bash
vercel domains add alfred.yourdomain.com
```

Then configure DNS as Vercel instructs.

---

## Need Help?

1. Check `PWA-TESTING.md` for detailed testing
2. Check `PWA-IMPLEMENTATION-SUMMARY.md` for technical details
3. Run `pwa-test.html` to diagnose issues
4. Check browser console for errors
