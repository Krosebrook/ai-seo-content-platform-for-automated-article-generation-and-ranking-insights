import { useState, useEffect } from 'react'
import { CreditCard, Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { blink } from '@/lib/blink'
import { toast } from 'sonner'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      '5 articles per month',
      'Basic AI writing',
      'Standard images',
      'Email support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: '/month',
    stripePriceId: 'price_pro_monthly',
    description: 'For serious content creators',
    features: [
      'Unlimited articles',
      'Advanced AI writing',
      'Premium images',
      'Rank tracking',
      'Priority support',
      'API access'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    stripePriceId: 'price_enterprise_monthly',
    description: 'For teams and agencies',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Custom AI models',
      'White-label options',
      'Dedicated support',
      'SLA guarantee'
    ]
  }
]

export function SettingsPage() {
  const [currentPlan, setCurrentPlan] = useState('free')
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') {
      toast.info('You are already on the free plan')
      return
    }

    toast.info('Stripe integration coming soon! This will redirect to checkout.')
    // In production, this would integrate with Stripe:
    // 1. Create checkout session
    // 2. Redirect to Stripe checkout
    // 3. Handle webhook for subscription creation
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-1">
                {plans.find(p => p.id === currentPlan)?.name} Plan
              </h3>
              <p className="text-muted-foreground">
                {currentPlan === 'free' 
                  ? 'Upgrade to unlock unlimited articles' 
                  : 'You have access to all features'
                }
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {plans.find(p => p.id === currentPlan)?.price}{plans.find(p => p.id === currentPlan)?.period}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "relative",
                plan.popular && "border-primary shadow-lg"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={currentPlan === plan.id ? "secondary" : plan.popular ? "default" : "outline"}
                  disabled={currentPlan === plan.id}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {currentPlan === plan.id ? 'Current Plan' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Articles Generated</span>
                <span className="text-sm text-muted-foreground">0 / {currentPlan === 'free' ? '5' : '∞'}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
