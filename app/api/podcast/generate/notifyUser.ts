import webpush from 'web-push'
import { kv } from '@vercel/kv'
import { type Subscription } from '../../../types'

if (process.env.VAPID_SUBJECT && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  console.log('Setting VAPID keys')
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

async function sendPushNotification (subscription: Subscription, data: any) {
  return await webpush.sendNotification(subscription, JSON.stringify(data))
}

export function getSubscriptionKey (userId: string, endpoint: string) {
  return `subscription:${userId}:${endpoint}`
}

async function getSubscriptions (userId: string) {
  const subscriptionKeys = await kv.keys(`subscription:${userId}:*`)
  return await Promise.all(subscriptionKeys.map(async key => await kv.get<Subscription>(key)))
}

async function deleteSubscription (subscription: Subscription) {
  console.log('Deleting subscription:', subscription.userId)
  const subscriptionKey = getSubscriptionKey(subscription.userId, subscription.endpoint)
  return await kv.del(subscriptionKey)
}

export async function notifyUser (userId: string, topic: string, durationSec: number, url: string) {
  try {
    const subscriptions = await getSubscriptions(userId)

    const durationMin = durationSec / 60

    const params = new URLSearchParams()
    params.set('topic', topic)
    params.set('travelTimeMin', durationMin.toString())
    params.set('audioFile', url)

    const data = {
      title: 'Your podcast is ready!',
      body: `Listen to ${durationMin} minutes on ${topic}.`,
      icon: '/icons/android-icon-192x192.png',
      badge: '/icons/android-icon-192x192.png',
      url: `/player?${params.toString()}`
    }

    if (subscriptions.length === 0) {
      console.log('No subscriptions found for user:', userId)
      return
    }

    console.log(`Notifying ${subscriptions.length} subscriptions for user ${userId}`)

    for (const subscription of subscriptions) {
      if (subscription) {
        try {
          await sendPushNotification(subscription, data)
        } catch (error: any) {
          if (error.statusCode === 410) {
            await deleteSubscription(subscription)
          } else {
            throw error
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
  }
}
