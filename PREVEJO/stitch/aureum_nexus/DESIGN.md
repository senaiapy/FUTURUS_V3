# Design System Document

## 1. Overview & Creative North Star: "The Sovereign Futurist"

This design system is built to command authority in the high-stakes world of fintech. Moving away from the "friendly SaaS" aesthetic, we are adopting a **Creative North Star of "The Sovereign Futurist."** This direction blends the weight of traditional wealth (Gold, Deep Navy) with the transparency and speed of the digital future (Glassmorphism, Neon Cyan accents).

The experience must feel like a premium trading terminal or a private digital vault. We break the "template" look through **intentional asymmetry**: large, high-impact typography balances against intricate, data-dense glass cards. Elements should overlap—hero text bleeding into data visualizations—to create a sense of depth and architectural complexity that feels intentional and bespoke.

---

## 2. Colors

The palette is designed for high-contrast legibility against a low-light environment, using "vibrant gold" as a beacon for action.

*   **Background & Surfaces:**
    *   `background`: #10141a (Deep charcoal/navy base)
    *   `surface-container-lowest`: #0a0e14 (Used for deep "recessed" areas like footer or input tracks)
    *   `surface-container-highest`: #31353c (Used for primary cards to pop against the background)
*   **Brand & Accents:**
    *   `primary`: #f2ca50 (The high-energy highlight gold)
    *   `primary-container`: #d4af37 (The core signature gold for CTAs)
    *   `tertiary`: #00e3fd (A futuristic cyan for secondary data points and tech-forward "glow" effects)
*   **The "No-Line" Rule:** 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined through background color shifts. For example, transition from a `surface` hero to a `surface-container-low` feature section.
*   **The "Glass & Gradient" Rule:** Floating UI elements must use `surface-variant` with a `backdrop-filter: blur(12px)` at 60% opacity. This allows the navy background to bleed through, creating a sophisticated "frosted glass" look.
*   **Signature Textures:** Main buttons should use a linear gradient from `primary` (#f2ca50) to `primary-container` (#d4af37) at a 45-degree angle to provide a metallic, premium feel.

---

## 3. Typography

The typography strategy pairs the structural authority of **Manrope** with the technical precision of **Inter** and **Space Grotesk**.

*   **Display (Manrope):** Large-scale, bold headlines (`display-lg` at 3.5rem) should use tight letter-spacing (-0.02em) to feel impactful and modern.
*   **Headline & Title (Manrope/Inter):** Used for section headers. Manrope provides a tech-forward "architectural" feel, while Inter ensures the narrative titles are perfectly legible.
*   **Body (Inter):** All body text must use `body-lg` or `body-md` in `on-background` (#dfe2eb). It provides a "crisp white" contrast that is easy on the eyes in dark mode.
*   **Labels (Space Grotesk):** Small, all-caps labels (`label-md`) are used for data points, countdown timers, and technical micro-copy. This mono-spaced influence suggests precision and algorithmic accuracy.

---

## 4. Elevation & Depth

We eschew traditional drop shadows for **Tonal Layering** and **Ambient Glows**.

*   **The Layering Principle:** Construct the UI as a series of physical layers. Place a `surface-container-highest` card on a `surface` background. The color shift provides the "lift."
*   **Ambient Shadows:** If a card must float, use a shadow with a 40px blur, 0% spread, and 8% opacity. The shadow color should be sampled from `surface-container-lowest` (#0a0e14) to feel like a natural occlusion of light.
*   **The "Ghost Border" Fallback:** If a container needs more definition, use a "Ghost Border": the `outline-variant` (#4d4635) at 20% opacity. This creates a sharp, clean edge without the "heavy" feeling of a standard border.
*   **The "Futuristic Glow":** For high-priority elements (like the countdown boxes in the reference image), apply a subtle `outer-glow` using the `primary` color at 10% opacity to mimic an emitting screen.

---

## 5. Components

*   **Buttons:**
    *   **Primary:** Gradient of `primary` to `primary-container`. Sharp corners (`rounded-sm`: 0.125rem) to maintain the "tech-forward" edge.
    *   **Tertiary/Ghost:** `on-background` text with a `primary` underline on hover. No container.
*   **Glass Cards:** Use `surface-container-high` with 40% transparency and `backdrop-filter: blur(16px)`. Border must be a `Ghost Border` at 15% opacity.
*   **Input Fields:** Background should be `surface-container-lowest` with a bottom-only `outline-variant` border. On focus, the border transitions to `primary` with a 2px height.
*   **Countdown/Data Chips:** High-contrast blocks using `surface-container-highest`. Use `Space Grotesk` for numbers to emphasize the "fintech" utility. Forbid the use of divider lines between these units; use `spacing-2` (0.7rem) for separation.
*   **Data Visualization:** Use `tertiary` (#00e3fd) for trend lines and `primary` for peak values. Use a gradient fill under lines to add "soul" to the charts.

---

## 6. Do's and Don'ts

### Do:
*   **DO** use whitespace as a functional tool. Use `spacing-16` (5.5rem) between major sections to let the high-end typography breathe.
*   **DO** layer glass elements over subtle background gradients (Navy to Charcoal) to create a sense of infinite digital space.
*   **DO** use the `primary` gold sparingly. If everything is gold, nothing is premium. Use it only for the most critical user actions.

### Don't:
*   **DON'T** use `rounded-full` for buttons or containers. This system relies on "sharp, clean" edges (`rounded-sm` or `none`) to convey professional authority.
*   **DON'T** use pure black (#000000) or pure white (#FFFFFF). Use the provided `surface` and `on-background` tokens to maintain the "charcoal and off-white" tonal depth.
*   **DON'T** use standard 1px borders to separate content. Use the `surface` hierarchy or vertical spacing from the scale.