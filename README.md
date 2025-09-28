# MineFunKing

A custom Electron-based client for MineFun with enhanced features and scripts.

## Prerequisites

Before you begin, ensure you have met the following requirements:
- You have installed Node.js 22.14.0 or newer
- You have npm (Node Package Manager) installed
- You are using Windows.(I haven't tested on Linux and macOS.)

## Deployment

To deploy MineFunKing, follow these steps:

1. Clone the repository or download the source code
2. Install the required dependencies using npm
   ```
   npm install
   ```

To start MineFunKing in development mode, run:

   ```
   npm start
   ```

## Building for Production

### Local Build

To build the application for production deployment locally, use the following command:

```
npm run dist
```

This will create platform-specific distributable packages (NSIS installer for Windows, AppImage for Linux, and default package for macOS) according to the configuration in `electron-builder.yml`.

### GitHub Actions Build

The project is configured with GitHub Actions for automated builds. To use this:

1. Ensure the repository has the `.github/workflows/build.yml` file configured
2. Before running the workflow, you need to prepare a `secret.key` file and add it as a GitHub Secret in your repository:
   - Create a `secret.key` file with your encryption key
   - Go to your GitHub repository settings > Secrets and variables > Actions
   - Add a new secret with the name `SECRET_KEY` and paste the content of your `secret.key` file
3. Trigger the workflow manually through the GitHub Actions tab using the `workflow_dispatch` event

The GitHub Actions workflow is configured to run on Windows and will build the application using Node.js 22.14.0.

## Project Structure

```
├── index.js             # Main Electron entry point
├── js/
│   ├── preload/         
│   ├── userscripts/     # User scripts (game enhancements)
│   │   ├── MineFunKing.user.js           # Game cheat features
│   │   └── MineFunChatTranslator.user.js # Chat translation functionality
│   └── utils/           
├── html/                
├── package.json         # Project configuration and dependencies
└── electron-builder.yml # Build configuration
```

## Local Script Loading

This application features a local script loading mechanism that loads user scripts from the `js/userscripts` directory instead of fetching them from remote URLs. This provides better performance, offline capability, and allows for easy customization of the scripts.

The following user scripts are included:
- **MineFunKing.user.js**: Contains game enhancement features
- **MineFunChatTranslator.user.js**: Provides chat translation functionality

## Additional Notes
- Modify the scripts in `js/userscripts` directory to customize functionality
