# FamilyMedManager - Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Ensure you have a paid Apple Developer account (for iOS)
- [ ] Set up Google Play Console account (for Android)
- [ ] Install EAS CLI: `npm install -g @expo/eas-cli`
- [ ] Login to EAS: `eas login`

### 2. Configuration Updates

#### Update EAS Configuration
Before deploying, update the placeholder values in `eas.json`:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-apple-team-id"
      },
      "android": {
        "serviceAccountKeyPath": "path/to/your-google-service-account-key.json",
        "track": "internal"
      }
    }
  }
}
```

#### Environment Variables
Create a `.env` file with your OpenAI API key:
```
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

### 3. App Store Assets

#### iOS App Store Requirements
- App icon: 1024x1024px (already configured as `icon.png`)
- Screenshots for different device sizes
- App description and keywords
- Privacy policy URL (if collecting user data)

#### Google Play Store Requirements
- Feature graphic: 1024x500px
- Screenshots for different device sizes
- App description and keywords
- Privacy policy URL (if collecting user data)

## Building for Production

### 1. Development Build (for testing)
```bash
npm run build:development
```

### 2. Preview Build (for internal testing)
```bash
npm run build:preview
```

### 3. Production Build
```bash
npm run build:production
```

## App Store Submission

### iOS App Store
1. **Build the app**:
   ```bash
   eas build --platform ios --profile production
   ```

2. **Submit to App Store**:
   ```bash
   eas submit --platform ios
   ```

3. **Manual steps in App Store Connect**:
   - Add app metadata (description, keywords, category)
   - Upload screenshots
   - Set pricing and availability
   - Submit for review

### Google Play Store
1. **Build the app**:
   ```bash
   eas build --platform android --profile production
   ```

2. **Submit to Play Store**:
   ```bash
   eas submit --platform android
   ```

3. **Manual steps in Google Play Console**:
   - Add app metadata (description, keywords, category)
   - Upload screenshots and feature graphic
   - Set pricing and availability
   - Submit for review

## Version Management

### Updating App Version
1. Update version in `app.json`:
   ```json
   {
     "expo": {
       "version": "1.0.1"
     }
   }
   ```

2. For iOS, also update `buildNumber` in `app.json`
3. For Android, `versionCode` will auto-increment with EAS

### Release Process
1. Test thoroughly on development build
2. Create preview build for internal testing
3. Once approved, create production build
4. Submit to app stores
5. Monitor for crashes and user feedback

## Troubleshooting

### Common Issues
- **Apple Developer Account**: Ensure you have a paid developer account
- **Code Signing**: EAS handles this automatically with proper credentials
- **Build Failures**: Check logs in EAS dashboard
- **Submission Errors**: Verify all required metadata is provided

### Support Resources
- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)

## Post-Deployment

### Monitoring
- Monitor app performance and crashes
- Track user feedback and reviews
- Monitor API usage (OpenAI API for AI search)

### Updates
- Use EAS Update for over-the-air updates
- For major changes, submit new app store versions

## Security Considerations
- Keep API keys secure and never commit them to version control
- Use environment variables for sensitive configuration
- Regularly update dependencies for security patches
- Monitor for security vulnerabilities in third-party packages
