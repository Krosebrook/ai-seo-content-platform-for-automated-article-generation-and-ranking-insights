import { useEffect, useState } from 'react'
import { FileText, Trash2, Eye, Edit, Sparkles } from 'lucide-react'
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
import type { Article } from '@/types'

export function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArticles()
  }, [])

  const loadArticles = async () => {
    try {
      const user = await blink.auth.me()
      const data = await blink.db.articles.list<Article>({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setArticles(data)
    } catch (error) {
      console.error('Failed to load articles:', error)
      toast.error('Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return

    try {
      await blink.db.articles.delete(id)
      setArticles(articles.filter(a => a.id !== id))
      toast.success('Article deleted')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete article')
    }
  }

  const handlePublish = async (article: Article) => {
    try {
      await blink.db.articles.update(article.id, {
        status: article.status === 'published' ? 'draft' : 'published',
        updatedAt: new Date().toISOString()
      })
      
      setArticles(articles.map(a =>
        a.id === article.id
          ? { ...a, status: article.status === 'published' ? 'draft' : 'published' }
          : a
      ))
      
      toast.success(
        article.status === 'published'
          ? 'Article unpublished'
          : 'Article published'
      )
    } catch (error) {
      console.error('Publish error:', error)
      toast.error('Failed to update article')
    }
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
          <h2 className="text-3xl font-bold">Articles</h2>
          <p className="text-muted-foreground">
            Manage your SEO-optimized content
          </p>
        </div>
      </div>

      {articles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No articles yet</h3>
            <p className="text-muted-foreground mb-6">
              Start generating SEO-optimized content with AI
            </p>
            <Button>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Article
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Articles ({articles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">
                      {article.title}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {article.keywords}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={article.status === 'published' ? 'default' : 'secondary'}
                      >
                        {article.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(article.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePublish(article)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(article.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
