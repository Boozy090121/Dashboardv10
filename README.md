# Simplified Manufacturing Dashboard

A lightweight, resource-efficient dashboard for displaying manufacturing performance metrics without excessive dependencies or preprocessing.

## Features

- Clean, minimalist UI that displays key manufacturing metrics
- Optimized React code that prevents resource issues and infinite loops
- Proper handling of fetch requests with AbortController
- Simple, fast build process
- Fallback data loading to prevent errors

## Project Structure

The project uses a simplified architecture:

```
/src-new             # Source code directory
  /DataContext.js    # React context for data handling
  /Dashboard.js      # Main dashboard component
  /App.js            # Root application component
  /index.js          # Application entry point
  /index.css         # Application styles

/public/data         # Static data files
  /complete-data.json # Pre-processed dashboard data
```

## Development

To run the dashboard locally:

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Open http://localhost:3000 in your browser

## Deployment

This project is optimized for deployment on Netlify. The build process:

1. Copies the optimized code from src-new to src
2. Ensures the data file exists, creating a minimal version if needed
3. Builds the application with optimized settings
4. Copies data files to ensure they're properly served

### Deploying to Netlify

1. Connect your GitHub repository to Netlify
2. Use the following build settings:
   - Build command: `chmod +x netlify-build.sh && ./netlify-build.sh`
   - Publish directory: `build`

## Troubleshooting

If you encounter resource issues:

1. Check browser console for errors
2. Verify that the data file is properly loaded
3. Check for any infinite re-rendering in React components
4. Make sure AbortController is properly canceling pending fetches

## Technical Details

### Resource Optimization

This dashboard is designed to prevent the "net::ERR_INSUFFICIENT_RESOURCES" error by:

1. Properly aborting fetch requests when components unmount
2. Using React.memo, useMemo and useCallback to prevent unnecessary re-renders
3. Managing state efficiently to avoid rerenders
4. Keeping all critical state in a single context provider
5. Avoiding complex nested components that can lead to remounting loops 