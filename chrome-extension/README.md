# Recipe Book Clipper - Chrome Extension

One-click save recipes from any webpage to your Recipe Book.

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder

## Usage

1. Navigate to any recipe page
2. Click the orange Recipe Book icon in your toolbar
3. The badge shows status:
   - `...` = Extracting recipe
   - `OK` = Saved successfully (opens recipe in new tab)
   - `ERR` = Failed to extract

## Configuration

Edit `background.js` to change the API URL:

```js
const API_BASE_URL = "https://recipebook-production-2f06.up.railway.app";
```

## Requirements

- Recipe Book app deployed (currently at recipebook-production-2f06.up.railway.app)
- Valid ANTHROPIC_API_KEY configured in the app
