// Script to run the debug version of the app
require('react-scripts/bin/react-scripts.js');

// Override the entry point to use our debug version
process.env.REACT_APP_ENTRY_POINT = './src/debug-index.js';

console.log('Running app in debug mode with entry point:', process.env.REACT_APP_ENTRY_POINT); 