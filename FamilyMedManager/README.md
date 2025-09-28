# FamilyMedManager 💊

A comprehensive family medication management app built with React Native and Expo. Track medications, manage dosages, monitor inventory, and ensure your family's health needs are met efficiently.

## Features

- 👨‍👩‍👧‍👦 **Family Management**: Add and manage family members (adults and children)
- 💊 **Medication Tracking**: Comprehensive medication database with detailed information
- 📅 **Dosage Scheduling**: Set up and track medication schedules
- 📦 **Inventory Management**: Monitor medication stock levels and expiration dates
- 🔍 **AI-Powered Search**: Get medication recommendations and first aid guidance
- 📱 **Cross-Platform**: Works on iOS, Android, and Web
- 💾 **Local Storage**: Secure SQLite database for offline functionality

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd FamilyMedManager
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Add your OpenAI API key for AI search functionality
   ```

4. Start the development server
   ```bash
   npm start
   ```

### Development

- **iOS**: `npm run ios`
- **Android**: `npm run android`
- **Web**: `npm run web`

## Building for Production

### Development Build
```bash
npm run build:development
```

### Preview Build
```bash
npm run build:preview
```

### Production Build
```bash
npm run build:production
```

## App Store Deployment

### iOS App Store
1. Update the Apple ID and team information in `eas.json`
2. Build for production: `npm run build:production`
3. Submit to App Store: `npm run submit:ios`

### Google Play Store
1. Set up service account key in `eas.json`
2. Build for production: `npm run build:production`
3. Submit to Play Store: `npm run submit:android`

## Configuration

### App Configuration
- **App Name**: FamilyMedManager
- **Bundle ID**: com.magizhdevelopment.familymedmanager
- **Version**: 1.0.0

### Environment Variables
- `EXPO_PUBLIC_OPENAI_API_KEY`: OpenAI API key for AI search functionality

## Architecture

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Database**: SQLite with platform-aware fallback to localStorage
- **State Management**: React hooks and context
- **Styling**: Custom theme system with consistent design tokens

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
