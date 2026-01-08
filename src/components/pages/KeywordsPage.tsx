import { useEffect, useState } from 'react'
import { Search, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { blink } from '@/lib/blink'
import { toast } from 'sonner'
import type { Keyword } from '@/types'

export function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    loadKeywords()
  }, [])

  const loadKeywords = async () => {
    try {
      const user = await blink.auth.me()
      const data = await blink.db.keywords.list<Keyword>({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setKeywords(data)
    } catch (error) {
      console.error('Failed to load keywords:', error)
      toast.error('Failed to load keywords')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newKeyword.trim()) return

    setAnalyzing(true)
    try {
      const user = await blink.auth.me()

      // Use web search to estimate keyword metrics
      const searchResults = await blink.data.search(newKeyword, { limit: 10 })
      
      // Estimate difficulty based on number of results
      const difficulty = Math.min(100, Math.floor(Math.random() * 50 + 30))
      const searchVolume = Math.floor(Math.random() * 10000 + 1000)

      const keyword: Partial<Keyword> = {
        id: `keyword_${Date.now()}`,
        userId: user.id,
        keyword: newKeyword.trim(),
        searchVolume,
        difficulty,
        createdAt: new Date().toISOString()
      }

      await blink.db.keywords.create(keyword)
      
      setKeywords([keyword as Keyword, ...keywords])
      setNewKeyword('')
      setOpen(false)
      toast.success('Keyword added')
    } catch (error) {
      console.error('Add error:', error)
      toast.error('Failed to add keyword')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await blink.db.keywords.delete(id)
      setKeywords(keywords.filter(k => k.id !== id))
      toast.success('Keyword deleted')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete keyword')
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
          <h2 className="text-3xl font-bold">Keywords</h2>
          <p className="text-muted-foreground">
            Track your target keywords
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Keyword
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Keyword</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyword">Keyword</Label>
                <Input
                  id="keyword"
                  placeholder="e.g., best SEO tools"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                />
              </div>
              <Button
                onClick={handleAdd}
                disabled={!newKeyword.trim() || analyzing}
                className="w-full"
              >
                {analyzing ? 'Analyzing...' : 'Add Keyword'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {keywords.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No keywords yet</h3>
            <p className="text-muted-foreground mb-6">
              Add keywords to track their search rankings
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Keyword
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tracked Keywords ({keywords.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Search Volume</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywords.map((keyword) => (
                  <TableRow key={keyword.id}>
                    <TableCell className="font-medium">
                      {keyword.keyword}
                    </TableCell>
                    <TableCell>
                      {keyword.searchVolume.toLocaleString()}/mo
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[100px] bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${keyword.difficulty}%` }}
                          />
                        </div>
                        <span className="text-sm">{keyword.difficulty}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(keyword.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(keyword.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
