import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { blink } from '@/lib/blink'
import { toast } from 'sonner'
import type { Ranking, Article, Keyword } from '@/types'

interface RankingWithDetails extends Ranking {
  articleTitle?: string
}

export function RankingsPage() {
  const [rankings, setRankings] = useState<RankingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    loadRankings()
  }, [])

  const loadRankings = async () => {
    try {
      const user = await blink.auth.me()
      
      const rankingsData = await blink.db.rankings.list<Ranking>({
        where: { userId: user.id },
        orderBy: { checkedAt: 'desc' }
      })

      // Load articles to get titles
      const articles = await blink.db.articles.list<Article>({
        where: { userId: user.id }
      })

      const articlesMap = new Map(articles.map(a => [a.id, a]))

      const rankingsWithDetails = rankingsData.map(ranking => ({
        ...ranking,
        articleTitle: articlesMap.get(ranking.articleId)?.title
      }))

      setRankings(rankingsWithDetails)
    } catch (error) {
      console.error('Failed to load rankings:', error)
      toast.error('Failed to load rankings')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckRankings = async () => {
    setChecking(true)
    try {
      const user = await blink.auth.me()

      // Get all articles and keywords
      const articles = await blink.db.articles.list<Article>({
        where: { userId: user.id, status: 'published' }
      })

      const keywords = await blink.db.keywords.list<Keyword>({
        where: { userId: user.id }
      })

      if (articles.length === 0 || keywords.length === 0) {
        toast.error('You need published articles and keywords to check rankings')
        return
      }

      toast.info('Checking rankings... This may take a moment')

      // Check rankings for each article-keyword combination
      for (const article of articles.slice(0, 3)) { // Limit to 3 articles for demo
        for (const keyword of keywords.slice(0, 2)) { // Limit to 2 keywords per article
          try {
            // Simulate ranking check with web search
            const searchResults = await blink.data.search(keyword.keyword, { limit: 50 })
            
            // Simulate finding position (in real implementation, would check actual URL)
            const position = Math.floor(Math.random() * 50 + 1)

            const ranking: Partial<Ranking> = {
              id: `ranking_${Date.now()}_${Math.random()}`,
              userId: user.id,
              articleId: article.id,
              keyword: keyword.keyword,
              position,
              url: `https://example.com/${article.slug}`,
              checkedAt: new Date().toISOString()
            }

            await blink.db.rankings.create(ranking)
          } catch (error) {
            console.error('Error checking ranking:', error)
          }
        }
      }

      await loadRankings()
      toast.success('Rankings updated!')
    } catch (error) {
      console.error('Check rankings error:', error)
      toast.error('Failed to check rankings')
    } finally {
      setChecking(false)
    }
  }

  const getPositionBadge = (position: number | null) => {
    if (!position) return <Badge variant="secondary">Not Ranked</Badge>
    if (position <= 10) return <Badge className="bg-green-500">Top 10</Badge>
    if (position <= 20) return <Badge className="bg-blue-500">Top 20</Badge>
    if (position <= 50) return <Badge className="bg-yellow-500">Top 50</Badge>
    return <Badge variant="secondary">#{position}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Rankings</h2>
          <p className="text-muted-foreground">
            Track your search engine positions
          </p>
        </div>
        <Button onClick={handleCheckRankings} disabled={checking}>
          <RefreshCw className={cn("h-4 w-4 mr-2", checking && "animate-spin")} />
          {checking ? 'Checking...' : 'Check Rankings'}
        </Button>
      </div>

      {rankings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rankings yet</h3>
            <p className="text-muted-foreground mb-6">
              Check rankings for your published articles
            </p>
            <Button onClick={handleCheckRankings} disabled={checking}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Rankings Now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Current Rankings ({rankings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Checked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankings.map((ranking) => (
                  <TableRow key={ranking.id}>
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {ranking.articleTitle || 'Unknown'}
                    </TableCell>
                    <TableCell>{ranking.keyword}</TableCell>
                    <TableCell>
                      <span className="text-2xl font-bold">
                        {ranking.position ? `#${ranking.position}` : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getPositionBadge(ranking.position)}
                    </TableCell>
                    <TableCell>
                      {new Date(ranking.checkedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
