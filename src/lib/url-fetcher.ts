export async function fetchUrlContent(url: string): Promise<string> {
  console.log("[url-fetcher] Fetching URL:", url);
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; RecipeBot/1.0; +https://recipebook.app)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    console.error("[url-fetcher] Fetch failed:", { url, status: response.status, statusText: response.statusText });
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  console.log("[url-fetcher] Fetch successful", { url, htmlLength: html.length });
  return extractTextFromHtml(html);
}

function extractTextFromHtml(html: string): string {
  // Remove script and style tags with their content
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, "");

  // Replace common block-level tags with newlines
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|br)>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  text = decodeHtmlEntities(text);

  // Clean up whitespace
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n[ \t]+/g, "\n");
  text = text.replace(/[ \t]+\n/g, "\n");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();

  return text;
}

function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&deg;": "°",
    "&frac12;": "½",
    "&frac14;": "¼",
    "&frac34;": "¾",
  };

  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, "gi"), char);
  }

  // Handle numeric entities
  result = result.replace(/&#(\d+);/g, (_, code) =>
    String.fromCharCode(parseInt(code, 10))
  );
  result = result.replace(/&#x([0-9a-f]+);/gi, (_, code) =>
    String.fromCharCode(parseInt(code, 16))
  );

  return result;
}
