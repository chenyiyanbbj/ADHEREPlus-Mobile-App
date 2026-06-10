# ADHERE+ Patient App

React Native patient app scaffold for ADHERE+, built with Expo Router and NativeWind.

## Tech Stack

- React Native
- Expo SDK 54
- Expo Router
- NativeWind
- Supabase JS SDK
- Expo Notifications

## Requirements

- Node `22.x`
- npm `10+`
- Expo Go on iPhone or Android

This project has been tested against `Node 22`. Using `Node 24` caused Expo and Metro compatibility issues during setup.

## Setup

1. Install Node `22`
   - If you use `nvm`, run `nvm use` from the project root.
   - The repo includes [.nvmrc](/Users/yiyan/Desktop/ADHERE/ADHERE+%20Mobile%20App%20UI%20(1)/.nvmrc:1).
2. Install dependencies
   ```bash
   npm install
   ```
3. Create a local env file
   ```bash
   cp .env.example .env.local
   ```
4. Fill in the Supabase values in `.env.local`
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

At the moment the app still uses mock data by default, so missing Supabase values will not block basic UI review.

## Run

- Start Expo
  ```bash
  npm start
  ```

- Start Expo and clear cache
  ```bash
  npm run start:clear
  ```

- iOS native run
  ```bash
  npm run ios
  ```

- Android native run
  ```bash
  npm run android
  ```

- Type check
  ```bash
  npm run typecheck
  ```

## Expo Go

- Use Expo Go with `Expo SDK 54`
- Keep the phone and development machine on the same Wi-Fi
- If QR loading is unstable, restart with:
  ```bash
  npx expo start --clear
  ```

## Project Structure

```text
app/                  Expo Router screens
src/components/       Reusable RN UI
src/store/            Mock state, selectors, session/app providers
src/lib/              Supabase and notification helpers
src/theme/            Design tokens
src/types/            DB-shaped TypeScript types
src/web-prototype/    Archived Figma-exported web prototype
```

## Current State

- Patient-side RN skeleton is in place
- Login, Today, Medications, Calendar, Passport, Profile, Change Password screens exist
- Bottom tab bar includes the center `+` medication entry
- Data is currently mocked in [src/store/mock-data.ts](/Users/yiyan/Desktop/ADHERE/ADHERE+%20Mobile%20App%20UI%20(1)/src/store/mock-data.ts:1)
- Supabase client entry is prepared in [src/lib/supabase/client.ts](/Users/yiyan/Desktop/ADHERE/ADHERE+%20Mobile%20App%20UI%20(1)/src/lib/supabase/client.ts:1)

## Environment Notes

- `google-services.json` is intentionally not committed yet
- self-hosted Supabase is not wired yet
- doctor web app is not part of this repo

## Collaboration Notes

- The original Figma-exported web prototype is kept only as a visual and flow reference
- Do not add new routes under `src/`; Expo Router is configured to use `app/`
- If Expo Router behaves oddly after route changes, fully stop Expo and restart it
