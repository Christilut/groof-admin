// Generate a consistent color based on a string hash
export function getColorFromString(str: string): string {
  // Simple string hash function
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash // Convert to 32-bit integer
  }

  // Convert hash to HSL color
  // Use hue (0-360) for variety, keep saturation and lightness fixed for readability
  const hue = Math.abs(hash % 360)
  const saturation = 65 // 65% saturation for vibrant but not overwhelming colors
  const lightness = 65 // 45% lightness for good contrast on white background

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}
