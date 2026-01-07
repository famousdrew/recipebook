// Recipe Book Clipper - Background Service Worker
// One-click save recipes from any page

// Configure your API URL here
const API_BASE_URL = "https://recipebook-production-2f06.up.railway.app";

// Badge colors
const COLORS = {
  loading: "#3B82F6", // blue
  success: "#22C55E", // green
  error: "#EF4444",   // red
};

// Set badge state
function setBadge(text, color) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
}

// Clear badge after delay
function clearBadgeAfterDelay(ms = 3000) {
  setTimeout(() => {
    chrome.action.setBadgeText({ text: "" });
  }, ms);
}

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  // Ignore chrome:// and other internal pages
  if (!tab.url || !tab.url.startsWith("http")) {
    setBadge("!", COLORS.error);
    clearBadgeAfterDelay();
    console.log("Cannot extract recipe from this page type:", tab.url);
    return;
  }

  console.log("Extracting recipe from:", tab.url);
  setBadge("...", COLORS.loading);

  try {
    const response = await fetch(`${API_BASE_URL}/api/extract`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: tab.url,
        save: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to extract recipe");
    }

    console.log("Recipe saved:", data.recipe?.title || data.extracted?.title);
    setBadge("OK", COLORS.success);
    clearBadgeAfterDelay();

    // Optional: Open the saved recipe in a new tab
    if (data.recipe?.id) {
      chrome.tabs.create({
        url: `${API_BASE_URL}/recipes/${data.recipe.id}`,
        active: false,
      });
    }
  } catch (error) {
    console.error("Error saving recipe:", error);
    setBadge("ERR", COLORS.error);
    clearBadgeAfterDelay(5000);
  }
});
