/**
 * Custom ranking formula:
 * score = (rating * 0.4) + (price_score * 0.3) + (features_score * 0.3)
 */
export const calculateScore = (
  rating: number,
  price: number,
  maxPrice: number,
  minPrice: number,
  featuresScore: number
) => {
  // Normalize price: Lower price = Higher score
  // price_score = 1 - ((price - minPrice) / (maxPrice - minPrice))
  // If all prices are the same, maxPrice - minPrice = 0, default to 1 (max score)
  const priceRange = maxPrice - minPrice;
  const priceScore = priceRange === 0 ? 1 : 1 - (price - minPrice) / priceRange;

  // rating is usually 1-5, normalize to 0-1
  const normalizedRating = rating / 5;

  // featuresScore is already 0-1
  
  return (normalizedRating * 0.4 + priceScore * 0.3 + featuresScore * 0.3) * 100;
};

// Simplified feature scoring based on RAM and Camera for demonstration
export const getFeatureScore = (specs: Record<string, string>) => {
  let score = 0.5; // Baseline
  
  const ram = parseInt(specs.ram) || 0;
  if (ram >= 8) score += 0.2;
  else if (ram >= 6) score += 0.1;
  
  const camera = parseInt(specs.camera) || 0;
  if (camera >= 108) score += 0.3;
  else if (camera >= 64) score += 0.2;
  else if (camera >= 50) score += 0.1;

  return Math.min(score, 1);
};
