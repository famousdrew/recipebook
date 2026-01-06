import { anthropic } from "./claude";
import { fetchUrlContent } from "./url-fetcher";

export interface ExtractedIngredient {
  name: string;
  amount?: string;
  unit?: string;
}

export interface ExtractedRecipe {
  title: string;
  description?: string;
  instructions: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  ingredients: ExtractedIngredient[];
  categories: string[];
}

const EXTRACTION_PROMPT = `You are a recipe extraction assistant. Extract the recipe from the following web page content and return it as JSON.

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "title": "Recipe Title",
  "description": "Brief description of the dish",
  "instructions": "Step by step cooking instructions as a single string, with steps separated by newlines",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "ingredients": [
    {"name": "flour", "amount": "2", "unit": "cups"},
    {"name": "sugar", "amount": "1/2", "unit": "cup"}
  ],
  "categories": ["dessert", "baking"]
}

Rules:
- Times should be in minutes (numbers only, null if not found)
- Servings should be a number (null if not found)
- Categories should be relevant food categories (e.g., "dessert", "main course", "vegetarian", "quick meals")
- If information is not found, use null for optional fields
- Extract ALL ingredients mentioned
- Combine all instruction steps into one string with newlines between steps
- Keep the original wording as much as possible

Web page content:
`;

export async function extractRecipeFromUrl(url: string): Promise<ExtractedRecipe> {
  console.log("[recipe-extractor] Fetching content from URL:", url);
  const content = await fetchUrlContent(url);
  console.log("[recipe-extractor] Content fetched", { contentLength: content.length, url });

  // Limit content to avoid token limits
  const truncatedContent = content.slice(0, 15000);
  console.log("[recipe-extractor] Content truncated", { originalLength: content.length, truncatedLength: truncatedContent.length });

  console.log("[recipe-extractor] Calling Claude API...");
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: EXTRACTION_PROMPT + truncatedContent,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";
  console.log("[recipe-extractor] Claude response received", { responseLength: responseText.length, usage: message.usage });

  try {
    const recipe = JSON.parse(responseText) as ExtractedRecipe;
    console.log("[recipe-extractor] JSON parsed successfully", { title: recipe.title });
    return validateAndNormalizeRecipe(recipe);
  } catch (error) {
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("[recipe-extractor] Failed to parse JSON from Claude response:", { responseText: responseText.slice(0, 500), stack });
    throw new Error("Failed to parse recipe from AI response");
  }
}

function validateAndNormalizeRecipe(recipe: Partial<ExtractedRecipe>): ExtractedRecipe {
  if (!recipe.title || typeof recipe.title !== "string") {
    console.error("[recipe-extractor] Validation failed: Recipe must have a title", { recipe });
    throw new Error("Recipe must have a title");
  }

  if (!recipe.instructions || typeof recipe.instructions !== "string") {
    console.error("[recipe-extractor] Validation failed: Recipe must have instructions", { title: recipe.title });
    throw new Error("Recipe must have instructions");
  }

  if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
    console.error("[recipe-extractor] Validation failed: Recipe must have at least one ingredient", { title: recipe.title });
    throw new Error("Recipe must have at least one ingredient");
  }

  return {
    title: recipe.title.trim(),
    description: recipe.description?.trim(),
    instructions: recipe.instructions.trim(),
    prepTime: typeof recipe.prepTime === "number" ? recipe.prepTime : undefined,
    cookTime: typeof recipe.cookTime === "number" ? recipe.cookTime : undefined,
    servings: typeof recipe.servings === "number" ? recipe.servings : undefined,
    ingredients: recipe.ingredients.map((ing) => ({
      name: String(ing.name).trim(),
      amount: ing.amount?.toString().trim(),
      unit: ing.unit?.trim(),
    })),
    categories: Array.isArray(recipe.categories)
      ? recipe.categories.map((c) => String(c).trim().toLowerCase())
      : [],
  };
}
