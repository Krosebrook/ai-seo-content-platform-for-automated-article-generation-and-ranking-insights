export interface Article {
  id: string
  userId: string
  title: string
  content: string
  slug: string
  keywords: string
  metaDescription?: string
  featuredImage?: string
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}

export interface Keyword {
  id: string
  userId: string
  keyword: string
  searchVolume: number
  difficulty: number
  createdAt: string
}

export interface Ranking {
  id: string
  userId: string
  articleId: string
  keyword: string
  position: number | null
  url: string
  checkedAt: string
}

export interface Subscription {
  id: string
  userId: string
  planType: 'free' | 'starter' | 'pro' | 'enterprise'
  status: 'active' | 'canceled' | 'past_due'
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  currentPeriodStart?: string
  currentPeriodEnd?: string
  articlesGenerated: number
  createdAt: string
  updatedAt: string
}
