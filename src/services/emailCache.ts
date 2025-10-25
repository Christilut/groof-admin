// Email cache service for storing userId -> email mappings
class EmailCache {
  private cache: Map<string, string> = new Map()

  // Get email for a user ID
  get(userId: string): string | undefined {
    return this.cache.get(userId)
  }

  // Set email for a user ID
  set(userId: string, email: string): void {
    this.cache.set(userId, email)
  }

  // Get user IDs that are not in the cache
  getMissing(userIds: string[]): string[] {
    return userIds.filter(id => !this.cache.has(id))
  }

  // Set multiple emails at once
  setMany(emails: Record<string, string>): void {
    Object.entries(emails).forEach(([userId, email]) => {
      this.cache.set(userId, email)
    })
  }

  // Clear the cache (optional, for testing or logout)
  clear(): void {
    this.cache.clear()
  }
}

// Export a singleton instance
export const emailCache = new EmailCache()
