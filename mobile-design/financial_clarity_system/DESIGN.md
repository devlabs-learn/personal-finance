---
name: Financial Clarity System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45474c'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#330009'
  on-tertiary: '#ffffff'
  tertiary-container: '#590016'
  on-tertiary-container: '#ff4e69'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  numeral-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.03em
  numeral-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is engineered for a FinTech environment where trust, precision, and clarity are paramount. The brand personality is "The Sophisticated Navigator"—professional enough to handle life savings, yet intuitive enough for daily expense tracking. It bridges the gap between traditional banking stability and modern technological agility.

The aesthetic follows a **Modern Minimalist** approach with a focus on high-information density without clutter. The UI utilizes generous whitespace, purposeful data visualization, and a "content-first" hierarchy. By stripping away decorative elements, the design system ensures that the user's financial data remains the hero. The emotional response should be one of "calm control," reducing the anxiety often associated with personal finance through a clean, structured interface.

## Colors

The palette is built on a foundation of "Trust and Action." 

- **Primary (Slate Navy):** Used for navigation, primary buttons, and headings to establish authority and professional grounding.
- **Success (Emerald):** Reserved strictly for positive financial growth, income, "under budget" states, and completed transactions.
- **Alert (Coral):** A softer, more modern red used for expenses, "over budget" warnings, and critical alerts. It is designed to be noticeable without inducing panic.
- **Neutral (Slate):** A range of cool grays used for secondary text, borders, and backgrounds to maintain a crisp, clean environment.

The system is designed with high-contrast accessibility in mind. While the default is a "Crisp Light" theme using a subtle off-white background to reduce eye strain, the token structure supports a seamless transition to dark mode by swapping surface and background values.

## Typography

Typography in this design system prioritizes legibility and numerical clarity. 

**Plus Jakarta Sans** is used for headlines and display titles. Its slightly wider stance and modern apertures provide a friendly yet professional welcome. 

**Inter** is the workhorse for all body copy and financial data. Its tall x-height and distinct character shapes ensure that small-scale financial transactions remain legible. 

**Numerical Emphasis:** For account balances and transaction amounts, use the `numeral` roles. These utilize Inter’s tabular lining features to ensure that columns of numbers align perfectly, aiding in quick scanning and comparison of financial figures. Use `numeral-lg` for hero balances and `numeral-md` for list-item amounts.

## Layout & Spacing

The design system utilizes a **8px linear scale** for consistent vertical rhythm and internal component spacing. 

- **Grid System:** A 12-column fluid grid is used for desktop (breakpoint 1024px+), shifting to a 4-column grid for mobile (breakpoint 375px). 
- **Margins & Gutters:** Desktop layouts use 32px outer margins with 24px gutters. Mobile layouts compress to 16px margins with 16px gutters to maximize screen real estate for data tables and charts.
- **Data Density:** In transaction lists, use the `sm` and `md` spacing tokens to maintain high information density. In dashboard overviews, use `lg` and `xl` tokens to create "breathing room" around key performance indicators.

## Elevation & Depth

This design system uses a combination of **Tonal Layers** and **Ambient Shadows** to define hierarchy.

1.  **Level 0 (Background):** Used for the main canvas. No shadow.
2.  **Level 1 (Cards/Surface):** Used for transaction details and budget modules. Requires a 1px border (#E2E8F0) and a very soft, diffused shadow: `0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)`.
3.  **Level 2 (Modals/Popovers):** Used for adding new transactions. Requires a more pronounced shadow to lift the element off the page: `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`.

Avoid heavy black shadows. Shadows should be tinted with the primary color (Slate Navy) at very low opacities to maintain the "clean" minimalist feel.

## Shapes

The shape language is "Rounded," striking a balance between the rigid "square" look of traditional finance and the overly "bubbly" look of social apps.

- **Standard Elements:** Buttons, input fields, and small cards use a **8px (0.5rem)** radius.
- **Large Containers:** Dashboard widgets and main content areas use a **16px (1rem)** radius.
- **Feedback Elements:** Progress bars and "Add" buttons may use **full rounding (pill-shaped)** to distinguish them as interactive or status-based elements.

## Components

- **Cards:** The primary container for transactions. They should have a white background, a 1px border (#E2E8F0), and a Level 1 shadow. Headers within cards should use `label-md` for category names.
- **Buttons:** 
    - *Primary:* Solid Slate Navy with white text. 
    - *Secondary:* Ghost style with 1px Slate Navy border.
    - *Success/Action:* Solid Emerald for "Deposit" or "Save."
- **Progress Bars:** Used for budget tracking. Use a neutral gray background track (#F1F5F9). The fill color dynamically changes: Emerald for &lt;80% budget used, Yellow for 80-99%, and Coral for 100%+.
- **Input Fields:** Minimalist design with a 1px border. On focus, the border should thicken to 2px and change to the primary Slate Navy. Labels should always be visible using `label-sm`.
- **Chips:** Small, pill-shaped tags used for categorizing transactions (e.g., "Groceries," "Rent"). Use low-saturation background tints of the primary/secondary colors with high-saturation text.
- **Balances:** Hero balances on the dashboard must use `numeral-lg`. Use the Success color for positive trends and the Alert color for negative trends or over-limit states.