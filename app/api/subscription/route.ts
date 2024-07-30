// app/api/save-subscription/route.js
import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { type Subscription } from '../../types'
import { getSubscriptionKey } from '../podcast/generate/notifyUser'

export async function POST (request: Request) {
  const subscription: Subscription = await request.json()

  if (!subscription.userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  // Generate a unique key for the subscription
  const subscriptionKey = getSubscriptionKey(subscription.userId, subscription.endpoint)

  try {
    await kv.set(subscriptionKey, subscription)
    return NextResponse.json({ message: 'Subscription saved successfully' }, { status: 201 })
  } catch (error) {
    console.error('Error saving subscription:', error)
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}
