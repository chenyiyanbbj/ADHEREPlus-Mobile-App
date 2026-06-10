# ADHERE+ Mobile App

Patient-facing React Native app for ADHERE+, built with Expo Router, NativeWind, and TypeScript.

## Stack

- Expo SDK 54
- React Native 0.81
- React 19
- Expo Router
- NativeWind
- Supabase JS
- Expo Notifications

## Requirements

- Node `22.x`
- npm `10+`
- Xcode / Android Studio if you want to run native builds
- Expo Go if you only want device preview

The repo is pinned to Node `>=22 <23` in [`package.json`](./package.json). Expo setup in this project was verified against Node 22.

## Setup

1. Use the repo Node version
   ```bash
   nvm use
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Create a local env file
   ```bash
   cp .env.example .env.local
   ```
4. Fill in:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

The app currently ships with mock data, so basic UI flows can still be reviewed before Supabase is fully wired.

## Scripts

- Start Expo dev server
  ```bash
  npm start
  ```
- Start Expo and clear cache
  ```bash
  npm run start:clear
  ```
- Run iOS
  ```bash
  npm run ios
  ```
- Run Android
  ```bash
  npm run android
  ```
- Run web preview
  ```bash
  npm run web
  ```
- Type check
  ```bash
  npm run typecheck
  ```

## App Structure

```text
app/                        Expo Router routes
app/(auth)/                 Authentication screens
app/(tabs)/                 Main tab screens
app/medication/             Medication detail, create, and edit flows
app/settings/               Settings screens
src/components/             Reusable UI and medication components
src/lib/                    Shared utilities, Supabase, notifications
src/store/                  Session state, app data provider, mock data
src/styles/                 Shared CSS for web/nativewind support
src/theme/                  Color and typography tokens
src/types/                  Shared TypeScript types
```

## Current State

- Patient app shell and primary navigation are in place.
- Authentication, medication, calendar, passport, and profile flows are implemented.
- The app currently supports mocked data and is prepared for Supabase integration.

## Notes

- Expo Router is configured to use `app/` as the route root.
- `google-services.json` is not committed yet.
- The doctor-facing web app is not part of this repository.
