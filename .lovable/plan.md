# SEO & Technical Optimization Pass

Goal: strengthen local search visibility for Sarasota, FL, tighten semantic structure, and improve accessibility/performance signals — without changing the visual design.

## 1. Heading hierarchy (home page)
- Keep the hero headline "Protect today. Build a legendary tomorrow." as the single `h1`.
- Section titles stay `h2` (policies section, "Built on trust" / about section). Add a visible-or-screen-reader `h2` where a section currently has none (trust stats strip).
- Individual policy card titles (Term Life, Permanent Life, Annuities, HYSA, 401(k), Roth IRA…) become `h3`, nested under the section `h2`. Same for the policy modal title.
- Verify no other route renders a second `h1` on the home page.

## 2. Local SEO (Sarasota, FL)
- Home route title: "Legends Insurance Services | Financial Protection & Retirement in Sarasota, FL".
- Home meta description rewritten under 160 chars with location + CTA, mirrored into `og:title` / `og:description` / `twitter` tags.
- Correct the stale canonical/`og:url` on the home route (currently points at an old `build-a-buddy-16` domain) to `https://legendsinsuranceservices.lovable.app/`.
- Footer contact block marked up semantically with `<address>`, full Sarasota street/city/state/ZIP, phone (`tel:`/WhatsApp as today), email, and business hours (`<time>` where appropriate).
- Add LocalBusiness / InsuranceAgency JSON-LD (name, address, geo region, phone, opening hours, URL, sameAs socials) to the home route head.

## 3. Images
- Descriptive, keyword-aware `alt` text on every meaningful image (family photo, benefits team photo, policy cards, blog covers, logo). Decorative hero background keeps `alt=""`.
- Blog cover images get alt derived from the post title.
- `loading="lazy"` + `decoding="async"` everywhere except the hero LCP image, which keeps `fetchpriority="high"`.

## 4. Accessibility & interactivity
- `aria-label` on the language switcher (announcing the target language), Login/CTA where the label is ambiguous, mobile menu toggle (expanded state via `aria-expanded`), slideshow prev/next buttons, and the chat launcher/close/send buttons.
- Policy modal: confirm labelled dialog semantics and ESC/close behavior stay intact.

## 5. Language attribute
- The i18n provider will set `document.documentElement.lang` to `en`/`es` on mount and on every toggle, so the rendered HTML `lang` matches the active language.

## 6. Performance / fonts
- Trim the Google Fonts request to the weights actually used (Montserrat 600/900 for the wordmark, Inter 400/500/600/700, Fraunces display weights in use); drop any unused weight from the URL.
- Keep `preconnect` hints; confirm no unused CSS custom font loads remain.

## Technical notes
Files touched: `src/routes/index.tsx`, `src/routes/__root.tsx`, `src/components/PolicySlideshow.tsx`, `src/components/PolicyModal.tsx`, `src/components/Footer.tsx`, `src/components/Header.tsx`, `src/components/Chatbot.tsx`, `src/routes/blog.index.tsx`, `src/routes/blog.$slug.tsx`, `src/routes/benefits.tsx`, `src/lib/i18n.tsx`.

Open item: I need the exact street address for Sarasota (the footer currently shows only "Sarasota FL 34231, United States"). If you don't want a street address published, I'll structure the JSON-LD with city/state/ZIP only.
