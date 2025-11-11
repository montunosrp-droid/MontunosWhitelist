# Montunos Whitelist - Design Guidelines

## Design Approach
**System-Based with Discord UI Inspiration**
This utility-focused authentication app draws from Discord's clean, functional interface patterns while following Material Design principles for clarity and usability. The design prioritizes clear authentication flows and status verification over visual flourishes.

## Core Design Principles
1. **Functional Clarity**: Every element serves the authentication and verification workflow
2. **Immediate Feedback**: Clear visual states for login status and whitelist verification
3. **Discord Familiarity**: UI patterns that Discord users recognize and trust
4. **Progressive Disclosure**: Show information as users complete authentication steps

---

## Typography System

**Font Families** (via Google Fonts CDN):
- Primary: 'Inter' (400, 500, 600, 700) - UI elements, body text
- Display: 'Poppins' (600, 700) - Headings, status messages

**Type Scale**:
- Hero/Page Title: text-4xl font-bold (Poppins)
- Section Headers: text-2xl font-semibold (Poppins)
- Card Titles: text-lg font-semibold (Inter)
- Body: text-base font-normal (Inter)
- Labels/Meta: text-sm font-medium (Inter)
- Small/Helper: text-xs (Inter)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16, 24**
- Tight spacing: p-2, gap-2 (form elements, inline items)
- Standard spacing: p-4, gap-4, m-4 (cards, sections)
- Generous spacing: p-8, gap-8 (page sections, major components)
- Section spacing: py-12, py-16, py-24 (vertical rhythm)

**Container Strategy**:
- App max-width: max-w-6xl mx-auto
- Content cards: max-w-md to max-w-2xl (context-dependent)
- Full-bleed backgrounds with constrained content

**Grid System**:
- Single column layouts for authentication flows
- 2-column split for dashboard (user info + verification status)
- Responsive: stack to single column on mobile

---

## Component Library

### Authentication Flow Components

**Login Card**:
- Centered card design (max-w-md)
- Discord logo/branding at top
- Large "Login with Discord" button
- Subtle helper text below
- Elevated card treatment (shadow-lg)

**Discord OAuth Button**:
- Full-width primary action
- Discord icon (Font Awesome: fa-brands fa-discord)
- Clear button text: "Continue with Discord"
- Substantial padding (px-8 py-4)
- Rounded corners (rounded-lg)

### Dashboard Components

**User Profile Card**:
- Avatar + username + discriminator display
- Discord profile picture (circular, w-16 h-16 or w-20 h-20)
- User ID display (monospace, text-xs)
- "Logged in via Discord" status badge
- Logout button (secondary style)

**Whitelist Status Card**:
- Prominent status indicator (icon + text)
- Success state: Checkmark icon + "Whitelisted" message
- Pending/Not Found state: Info icon + instructional text
- Card layout with icon-left, content-right pattern
- Subtle border treatment

**Status Badges**:
- Pill-shaped (rounded-full)
- Small padding (px-3 py-1)
- Text size: text-xs font-medium
- Icon + text combination
- States: Success, Pending, Error, Info

### Navigation

**Header**:
- Sticky top navigation (if multi-page)
- Logo/app name left
- User avatar + logout right
- Minimal height (h-16)
- Border bottom for separation

**Footer** (optional for utility pages):
- Minimal centered text
- Links to support/documentation
- Small padding (py-6)

### Forms & Inputs

**Input Fields** (if needed for manual verification):
- Clear labels above inputs
- Consistent height (h-12)
- Rounded borders (rounded-md)
- Focus states with ring treatment
- Helper text below in text-sm

### Feedback Elements

**Loading States**:
- Spinner component (use Font Awesome: fa-spinner fa-spin)
- "Verifying..." or "Authenticating..." text
- Centered in card or overlay

**Empty States**:
- Icon + message combination
- Instructional text
- Call-to-action button if applicable

**Error Messages**:
- Alert box pattern (rounded-lg border)
- Icon + heading + description structure
- Dismiss button option

---

## Page Layouts

### Login Page
- Centered single card layout
- Minimal viewport: flex items-center justify-center min-h-screen
- Background: subtle pattern or gradient (no image needed)
- Card contains: logo, title, Discord login button, helper text

### Dashboard Page
- Two-column desktop layout (grid grid-cols-1 lg:grid-cols-2 gap-8)
- Left column: User profile card
- Right column: Whitelist status card
- Mobile: stacks to single column
- Consistent padding around content (p-6 to p-8)

### Error/Callback Pages
- Centered message card
- Clear status indication
- Redirect instructions or manual action button

---

## Icons
**Icon Library**: Font Awesome (via CDN)
- Discord: fa-brands fa-discord
- Check/Success: fa-solid fa-circle-check
- Error: fa-solid fa-circle-exclamation  
- Info: fa-solid fa-circle-info
- User: fa-solid fa-user
- Logout: fa-solid fa-right-from-bracket
- Loading: fa-solid fa-spinner

---

## Interaction Patterns

**Buttons**:
- Primary: Full background, bold text, substantial padding
- Secondary: Outlined variant, less visual weight
- Hover: Subtle opacity or brightness change
- Active: Slight scale or shadow adjustment
- No custom animations beyond standard transitions

**Cards**:
- Subtle shadow elevation (shadow-md to shadow-lg)
- Hover: Slight shadow increase for interactive cards
- Border radius: rounded-lg consistently

**Transitions**:
- Use sparingly: transition-all duration-200 for hovers
- No page transitions or scroll animations
- Focus on functional feedback only

---

## Accessibility Requirements
- Maintain WCAG AA contrast ratios (defer to color implementation)
- All interactive elements keyboard accessible
- Focus states visible with ring utilities
- ARIA labels on icon-only buttons
- Semantic HTML throughout
- Alt text for Discord avatars

---

## Images
**Discord User Avatars**: Profile pictures fetched from Discord CDN (circular treatment)
**Logo/Branding**: Discord logo or Montunos Whitelist custom logo at top of login card
**No hero images required** - this is a functional authentication app, not a marketing site