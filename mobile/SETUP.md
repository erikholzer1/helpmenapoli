# HelpMeNapoli — Mobile App Setup

## 1. Install Node.js

Download and install from **https://nodejs.org** (choose the LTS version).

Verify it worked:
```
node --version
npm --version
```

## 2. Install dependencies

```bash
cd /Users/erikholzer/Desktop/helpmenapoli/mobile
npm install
```

## 3. Download fonts

The app uses Playfair Display and DM Sans. Download them free from Google Fonts:

- **Playfair Display**: https://fonts.google.com/specimen/Playfair+Display
  - Download: Regular, Italic, Bold → rename to:
    - `assets/fonts/PlayfairDisplay-Regular.ttf`
    - `assets/fonts/PlayfairDisplay-Italic.ttf`
    - `assets/fonts/PlayfairDisplay-Bold.ttf`

- **DM Sans**: https://fonts.google.com/specimen/DM+Sans
  - Download: Light (300), Regular (400), Medium (500) → rename to:
    - `assets/fonts/DMSans-Light.ttf`
    - `assets/fonts/DMSans-Regular.ttf`
    - `assets/fonts/DMSans-Medium.ttf`

## 4. Run the app

```bash
npm start
```

Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with the **Expo Go** app on your phone.

## 5. Run on a real device

Install **Expo Go** from the App Store or Google Play. Scan the QR code from `npm start`.

---

## Project structure

```
mobile/
├── app/
│   ├── _layout.tsx         # Root layout, font loading
│   └── (tabs)/
│       ├── _layout.tsx     # Tab bar config
│       ├── index.tsx       # Home screen
│       ├── language.tsx    # Language phrasebook (vocab + phrases)
│       ├── discover.tsx    # Top 10 lists
│       ├── book.tsx        # Broker services
│       └── experiences.tsx # Courses & experiences
├── assets/
│   ├── fonts/              # Font files (see step 3)
│   └── images/             # Logo + photos (already copied)
└── constants/
    ├── Colors.ts           # Brand palette
    ├── phrases.ts          # Phrasebook: 9 categories, vocab + phrases
    ├── top10.ts            # Top 10 lists (4 lists, 40 entries)
    └── experiences.ts      # Courses & experiences data
```

## Production notes

- **Booking backend**: Currently uses `mailto:` links. Upgrade to Supabase Forms + email notification when ready.
- **Content management**: All content is in `constants/`. Move to Supabase when you want to edit without redeploying.
