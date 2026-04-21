# Analytics + Search Console Setup Checklist

## 1) Event names already implemented in code

- `sign_up` on successful registration
- `login` on successful login
- `checkout_click` on pricing CTA click

## 2) GA4: mark events as key events

1. Open GA4 property for `cvboosta.com`.
2. Go to `Admin -> Data display -> Key events`.
3. Click `New key event`.
4. Add these event names exactly:
   - `sign_up`
   - `login`
   - `checkout_click`

## 3) GA4: verify events are arriving

1. Go to `Reports -> Realtime`.
2. Trigger actions on site:
   - register account
   - login
   - click checkout button on `/pricing`
3. Confirm events appear in realtime stream.

## 4) GSC: sitemap

1. Open Google Search Console property for `cvboosta.com`.
2. Go to `Sitemaps`.
3. Submit:
   - `https://cvboosta.com/sitemap.xml`

## 5) GSC: request indexing for core pages

Use `URL Inspection` and request indexing for:

- `https://cvboosta.com/`
- `https://cvboosta.com/about`
- `https://cvboosta.com/pricing`
- `https://cvboosta.com/privacy`
- `https://cvboosta.com/terms`

