# Abhiradh Gorti — The Living Machine

A cinematic portfolio with eight scroll-directed architectural scenes, an original titanium ribbon sculpture, and two factual project case studies: HealthPatch and Atlas Universe Explorer.

## Run locally

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. Production: `npm run build`, then `npm start`. Type checking: `npm run typecheck`.

## Content and links

Edit `lib/content.ts` to maintain identity, capabilities, education and project descriptions. GitHub links point to the verified public repositories under `24kd1a05c3-dev`; email is `abhiradhgorti@gmail.com`.

The LinkedIn profile URL was supplied by Abhiradh and is configured without tracking parameters. The supplied résumé PDF is included in `public/Abhiradh_Gorti_Resume_ATS_optimized.pdf` and the download link is enabled. Place the supplied résumé in `public/Abhiradh_Gorti_Resume_ATS_optimized.pdf` and set `identity.resume` to `/Abhiradh_Gorti_Resume_ATS_optimized.pdf`. No credentials belong in this project. Verified Vercel links connect Atlas to its live explorer and HealthPatch to an isolated simulated demo.

HealthPatch's artwork is an illustrative device concept from the project; the gallery signal is simulated. The case study describes a research prototype, not a clinically validated product. Atlas uses an actual project capture; catalogue stars and reconstructed galaxies are distinguished in its description.

## Rendering and accessibility

One dynamically loaded React Three Fiber canvas renders the gallery. GSAP owns the scroll director and the single Lenis ticker. Camera and sculpture updates use references instead of React state each frame. Local generated environment lighting avoids remote HDR dependencies; adaptive pixel density and hidden-tab suspension limit rendering cost.

Semantic HTML contains all portfolio content. Native dialogs support focus containment, Escape, browser Back and focus restoration. View Options offers reduced motion and a static composition; `?static=1` loads the static experience directly. Operating-system reduced-motion preferences are respected. The static/error fallback retains all content and links.

The portfolio is a separate Next.js application; it does not replace the Atlas application in the parent directory. It has not been deployed or pushed as a new repository.



