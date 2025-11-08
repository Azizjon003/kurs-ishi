/**
 * Image search utility for fetching images from Unsplash
 * Used to enhance course paper chapters with relevant images
 */

interface DisplaySize {
  uri: string;
}

interface ImageResponse {
  images?: Array<{
    display_sizes?: DisplaySize[];
  }>;
}

const DEFAULT_HEADERS = {
  accept: "*/*",
  "accept-language": "en-US",
  "sec-ch-ua":
    '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Linux"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  cookie:
    "require_cookie_consent=false; xp-semantic-search=control; _sp_ses.0295=*",
  "Referrer-Policy": "origin-when-cross-origin",
};

const BASE_URL = "https://unsplash.com/ngetty/v3/search/images/creative";
const FALLBACK_QUERY = "technology";

/**
 * Create search URL with query parameters
 */
const createSearchUrl = (query: string): string => {
  const params = new URLSearchParams({
    exclude_editorial_use_only: "true",
    exclude_nudity: "true",
    fields: "display_set,referral_destinations,title",
    graphical_styles: "photography",
    page_size: "28",
    phrase: query,
    sort_order: "best_match",
  });

  return `${BASE_URL}?${params.toString()}`;
};

/**
 * Fetch image data from Unsplash API
 */
const fetchImageData = async (query: string): Promise<ImageResponse | null> => {
  try {
    const response = await fetch(createSearchUrl(query), {
      headers: {
        ...DEFAULT_HEADERS,
        Referer: `https://unsplash.com/s/photos/${query}`,
      },
      method: "GET",
    });

    if (!response.ok) {
      console.warn(`Image search HTTP error! status: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn("Error fetching image data:", error);
    return null;
  }
};

/**
 * Extract image URI from response
 */
const getImageUri = (
  images: ImageResponse["images"],
  index: number
): string => {
  const UZBEKISTAN_FALLBACK =
    "https://media.istockphoto.com/id/2148149010/photo/shah-i-zinda-samarkand-uzbekistan.jpg?a=1&b=1&s=612x612&w=0&k=20&c=axluvJXi7WKg_CvMizCfmf4Nw5LowPbjRu7rKBYun30=";

  // Safe checks
  if (!images || !Array.isArray(images) || !images[index]) {
    return UZBEKISTAN_FALLBACK;
  }

  const displaySizes = images[index].display_sizes;
  if (
    !displaySizes ||
    !Array.isArray(displaySizes) ||
    displaySizes.length === 0
  ) {
    return UZBEKISTAN_FALLBACK;
  }

  // Return 3rd image if available, otherwise 1st image
  return displaySizes.length >= 3 ? displaySizes[2].uri : displaySizes[0].uri;
};

/**
 * Search for images by query
 *
 * @param query - Search query (e.g., "cyber security", "data analysis")
 * @param index - Image index in results (default: 1)
 * @returns Image URL
 */
export const searchImages = async (
  query: string,
  index: number = 1
): Promise<string> => {
  try {
    console.log(`🔍 Searching image for: "${query}" (index: ${index})`);

    // Try with main query
    const response = await fetchImageData(query);
    if (response?.images && response.images.length > 0) {
      const imageUri = getImageUri(response.images, index);
      if (imageUri) {
        console.log(`✅ Found image for "${query}"`);
        return imageUri;
      }
    }

    // Fallback to generic technology image
    console.log(`⚠️ No results for "${query}", trying fallback: "${FALLBACK_QUERY}"`);
    const fallbackResponse = await fetchImageData(FALLBACK_QUERY);
    if (fallbackResponse?.images && fallbackResponse.images.length > 0) {
      const imageUri = getImageUri(fallbackResponse.images, index);
      if (imageUri) {
        console.log(`✅ Found fallback image`);
        return imageUri;
      }
    }

    // Ultimate fallback
    console.log(`⚠️ Using Uzbekistan fallback image`);
    return "https://media.istockphoto.com/id/2148149010/photo/shah-i-zinda-samarkand-uzbekistan.jpg?a=1&b=1&s=612x612&w=0&k=20&c=axluvJXi7WKg_CvMizCfmf4Nw5LowPbjRu7rKBYun30=";
  } catch (error) {
    console.error("Error in searchImages:", error);
    return "https://media.istockphoto.com/id/2148149010/photo/shah-i-zinda-samarkand-uzbekistan.jpg?a=1&b=1&s=612x612&w=0&k=20&c=axluvJXi7WKg_CvMizCfmf4Nw5LowPbjRu7rKBYun30=";
  }
};

/**
 * Search images for specific chapter topics
 */
export const searchChapterImages = async (topic: string): Promise<{
  theory: string;
  analysis: string;
  improvement: string;
}> => {
  console.log(`\n📸 Fetching images for topic: "${topic}"`);

  // Generate search queries based on topic
  const theoryQuery = `${topic} concept theory`;
  const analysisQuery = `${topic} data analysis statistics`;
  const improvementQuery = `${topic} innovation improvement technology`;

  try {
    // Fetch all images in parallel
    const [theoryImage, analysisImage, improvementImage] = await Promise.all([
      searchImages(theoryQuery, 0),
      searchImages(analysisQuery, 1),
      searchImages(improvementQuery, 2),
    ]);

    console.log(`✅ All chapter images fetched successfully\n`);

    return {
      theory: theoryImage,
      analysis: analysisImage,
      improvement: improvementImage,
    };
  } catch (error) {
    console.error("Error fetching chapter images:", error);

    // Return fallback images
    const fallback =
      "https://media.istockphoto.com/id/2148149010/photo/shah-i-zinda-samarkand-uzbekistan.jpg?a=1&b=1&s=612x612&w=0&k=20&c=axluvJXi7WKg_CvMizCfmf4Nw5LowPbjRu7rKBYun30=";

    return {
      theory: fallback,
      analysis: fallback,
      improvement: fallback,
    };
  }
};
