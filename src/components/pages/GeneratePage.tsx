import { useState } from 'react'
import { Sparkles, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { blink } from '@/lib/blink'
import { toast } from 'sonner'
import type { Article } from '@/types'

export function GeneratePage() {
  const [keywords, setKeywords] = useState('')
  const [title, setTitle] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedArticle, setGeneratedArticle] = useState<{
    title: string
    content: string
    metaDescription: string
    imageUrl: string
  } | null>(null)

  const handleGenerate = async () => {
    if (!keywords.trim()) {
      toast.error('Please enter keywords')
      return
    }

    setGenerating(true)
    try {
      const user = await blink.auth.me()

      // Generate article title if not provided
      const articleTitle = title.trim() || keywords.trim()

      // Generate article content
      toast.info('Generating article content...')
      const { text: content } = await blink.ai.generateText({
        prompt: `Write a comprehensive, SEO-optimized blog article about "${articleTitle}". 
        
Target keywords: ${keywords}

Requirements:
- Length: 1500-2000 words
- Include an engaging introduction
- Use clear headings and subheadings (H2, H3)
- Write in a conversational yet professional tone
- Include actionable tips and insights
- Add a compelling conclusion
- Optimize for the target keywords naturally

Format the article in markdown with proper headings.`,
        maxTokens: 2500
      })

      // Generate meta description
      toast.info('Generating meta description...')
      const { text: metaDesc } = await blink.ai.generateText({
        prompt: `Write a compelling SEO meta description (150-160 characters) for this article title: "${articleTitle}". Include the main keyword: ${keywords}`,
        maxTokens: 100
      })

      // Generate featured image
      toast.info('Generating featured image...')
      const { data: imageData } = await blink.ai.generateImage({
        prompt: `Professional blog header image for article about ${articleTitle}. Modern, clean, high-quality, relevant imagery. 16:9 aspect ratio.`,
        n: 1
      })

      const imageUrl = imageData[0]?.url || ''

      setGeneratedArticle({
        title: articleTitle,
        content,
        metaDescription: metaDesc.trim(),
        imageUrl
      })

      toast.success('Article generated successfully!')
    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Failed to generate article')
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!generatedArticle) return

    try {
      const user = await blink.auth.me()
      
      const slug = generatedArticle.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const now = new Date().toISOString()
      
      const article: Partial<Article> = {
        id: `article_${Date.now()}`,
        userId: user.id,
        title: generatedArticle.title,
        content: generatedArticle.content,
        slug,
        keywords,
        metaDescription: generatedArticle.metaDescription,
        featuredImage: generatedArticle.imageUrl,
        status: 'draft',
        createdAt: now,
        updatedAt: now
      }

      await blink.db.articles.create(article)

      toast.success('Article saved as draft!')
      
      // Reset form
      setGeneratedArticle(null)
      setKeywords('')
      setTitle('')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save article')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate SEO Article
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="keywords">Target Keywords *</Label>
            <Input
              id="keywords"
              placeholder="e.g., best SEO tools, content marketing strategy"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              disabled={generating}
            />
            <p className="text-sm text-muted-foreground">
              Enter your main keywords separated by commas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Article Title (Optional)</Label>
            <Input
              id="title"
              placeholder="Leave blank to auto-generate from keywords"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={generating}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Article
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Article Preview */}
      {generatedArticle && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Article</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Featured Image */}
            {generatedArticle.imageUrl && (
              <div className="rounded-lg overflow-hidden border">
                <img
                  src={generatedArticle.imageUrl}
                  alt={generatedArticle.title}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Title */}
            <div>
              <Label>Title</Label>
              <h2 className="text-2xl font-bold mt-2">{generatedArticle.title}</h2>
            </div>

            {/* Meta Description */}
            <div>
              <Label>Meta Description</Label>
              <p className="text-muted-foreground mt-2">
                {generatedArticle.metaDescription}
              </p>
            </div>

            {/* Content */}
            <div>
              <Label>Content</Label>
              <div className="mt-2 p-4 rounded-lg border bg-muted/50 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {generatedArticle.content}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button onClick={handleSave} className="flex-1">
                Save as Draft
              </Button>
              <Button
                variant="outline"
                onClick={() => setGeneratedArticle(null)}
                className="flex-1"
              >
                Discard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
