'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { ApiResponse } from '@/types/apiResponse'
import { useCompletion } from '@ai-sdk/react'
import axios, { AxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

const cleanSuggestion = (item: string) => {
  return item
    .replace(/^\d+[\).\-\s]*/, '')
    .replace(/^[-*•]\s*/, '')
    .replace(/^["']|["']$/g, '')
    .trim()
}

const parseSuggestionList = (rawText: string) => {
  const normalized = rawText.replace(/\r/g, '').trim()
  if (!normalized) return []

  if (normalized.includes('||')) {
    return normalized
      .split('||')
      .map((item) => cleanSuggestion(item.replace(/\n+/g, ' ')))
      .filter(Boolean)
  }

  const byLine = normalized
    .split('\n')
    .map((item) => cleanSuggestion(item))
    .filter(Boolean)
  if (byLine.length > 1) return byLine

  const byQuestion = normalized
    .split('?')
    .map((item) => cleanSuggestion(item))
    .filter(Boolean)
    .map((item) => `${item}?`)
  if (byQuestion.length > 1) return byQuestion

  const singleLine = cleanSuggestion(normalized.replace(/\n+/g, ' '))
  return singleLine ? [singleLine] : []
}

const PublicProfilePage = () => {
  const params = useParams<{ username: string | string[] }>()
  const username = useMemo(() => {
    const rawUsername = params?.username
    if (!rawUsername) return ''
    return Array.isArray(rawUsername) ? rawUsername[0] : rawUsername
  }, [params])

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [messageText, setMessageText] = useState('')
  const [isAcceptingMessage, setIsAcceptingMessage] = useState(false)
  const [isStatusLoading, setIsStatusLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [userExists, setUserExists] = useState(true)

  const {
    completion,
    complete,
    isLoading: isSuggesting,
    setCompletion,
  } = useCompletion({
    api: '/api/suggest-messages',
    streamProtocol: 'text',
    onError: () => {
      toast.error('সাজেশন আনতে সমস্যা হয়েছে', {
        description: 'কিছুক্ষণ পরে আবার চেষ্টা করুন।',
      })
    },
  })

  const suggestions = useMemo(
    () => parseSuggestionList(completion).slice(0, 3),
    [completion]
  )

  useEffect(() => {
    if (!username) {
      setUserExists(false)
      setIsStatusLoading(false)
      return
    }

    let ignore = false

    const checkUserStatus = async () => {
      setIsStatusLoading(true)
      setUserExists(true)

      try {
        const response = await axios.post<ApiResponse>('/api/check-user-status', {
          identifier: username,
        })

        if (ignore) return

        const acceptingStatus = response.data.isAcceptingMessage ?? false
        setIsAcceptingMessage(acceptingStatus)
        if (!acceptingStatus) {
          toast.error('ইউজার বার্তা গ্রহণ করছে না')
        }
      } catch (error) {
        if (ignore) return

        const axiosError = error as AxiosError<ApiResponse>
        if (axiosError.response?.status === 404) {
          setUserExists(false)
          toast.error('ইউজার পাওয়া যায়নি')
        } else {
          toast.error('ইউজারের তথ্য আনা যায়নি', {
            description: 'কিছুক্ষণ পরে আবার চেষ্টা করুন।',
          })
        }
      } finally {
        if (!ignore) {
          setIsStatusLoading(false)
        }
      }
    }

    checkUserStatus()

    return () => {
      ignore = true
    }
  }, [username])

  const handleSendMessage = async () => {
    if (!isAcceptingMessage) {
      toast.error('ইউজার বার্তা গ্রহণ করছে না')
      return
    }

    if (!messageText.trim()) {
      toast.error('মেসেজ খালি রাখা যাবে না')
      return
    }

    setIsSending(true)
    try {
      await axios.post<ApiResponse>('/api/send-message', {
        username,
        content: messageText.trim(),
      })

      toast.success('মেসেজ পাঠানো হয়েছে')
      setMessageText('')
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      let errorDescription = 'আবার চেষ্টা করুন।'

      if (axiosError.response?.status === 403) {
        errorDescription = 'ইউজার বর্তমানে মেসেজ গ্রহণ করছে না।'
      } else if (axiosError.response?.status === 404) {
        errorDescription = 'ইউজার পাওয়া যায়নি।'
      }

      toast.error('মেসেজ পাঠানো যায়নি', {
        description: errorDescription,
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleGetSuggestions = async () => {
    setCompletion('')
    const generatedText = await complete(
      'তিনটি সংক্ষিপ্ত, বন্ধুসুলভ এবং ওপেন-এন্ডেড প্রশ্ন দাও। প্রতিটি প্রশ্ন "||" দিয়ে আলাদা থাকবে।'
    )

    if (!generatedText) {
      return
    }

    if (parseSuggestionList(generatedText).length === 0) {
      toast.error('সাজেশন পাওয়া যায়নি', {
        description: 'আবার বাটনে ক্লিক করে চেষ্টা করুন।',
      })
    }
  }

  const handleSuggestionClick = (selectedSuggestion: string) => {
    setMessageText(selectedSuggestion)
    textareaRef.current?.focus()
  }

  if (isStatusLoading) {
    return (
      <div className='mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-10'>
        <Card className='w-full'>
          <CardContent className='flex items-center justify-center gap-3 py-10'>
            <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
            <p className='text-sm text-muted-foreground'>ইউজারের তথ্য দেখা হচ্ছে...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!userExists) {
    return (
      <div className='mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-10'>
        <Card className='w-full'>
          <CardHeader>
            <CardTitle>ইউজার পাওয়া যায়নি</CardTitle>
            <CardDescription>দয়া করে ইউজারনেম চেক করে আবার চেষ্টা করুন।</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-10'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>পাবলিক প্রোফাইল</CardTitle>
          <CardDescription>
            <span className='font-medium'>@{username}</span> কে একটি অ্যানোনিমাস মেসেজ পাঠান।
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='public-message'>আপনার মেসেজ</Label>
            <Textarea
              ref={textareaRef}
              id='public-message'
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              placeholder='এখানে আপনার মেসেজ লিখুন...'
              rows={5}
            />
          </div>

          <div className='space-y-2'>
            <Button
              type='button'
              onClick={handleSendMessage}
              disabled={!isAcceptingMessage || isSending}
              className='w-full'
            >
              {isSending ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  পাঠানো হচ্ছে...
                </>
              ) : isAcceptingMessage ? (
                'সেন্ড'
              ) : (
                'ইউজার বার্তা গ্রহণ করছে না'
              )}
            </Button>
            {!isAcceptingMessage && (
              <p className='text-sm text-muted-foreground'>
                এই ইউজার এখন মেসেজ গ্রহণ বন্ধ রেখেছে।
              </p>
            )}
          </div>

          <Separator />

          <div className='space-y-3'>
            <Button
              type='button'
              variant='outline'
              onClick={handleGetSuggestions}
              disabled={isSuggesting}
              className='w-full'
            >
              {isSuggesting ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  সাজেশন তৈরি হচ্ছে...
                </>
              ) : (
                'গেট সাজেশন মেসেজ'
              )}
            </Button>

            <div className='grid gap-3'>
              {[0, 1, 2].map((index) => {
                const suggestion = suggestions[index]

                return (
                  <Button
                    key={index}
                    type='button'
                    variant='outline'
                    className='h-auto w-full justify-start whitespace-normal px-4 py-3 text-left'
                    disabled={!suggestion}
                    onClick={() => suggestion && handleSuggestionClick(suggestion)}
                  >
                    {suggestion ||
                      (isSuggesting
                        ? 'সাজেশন আসছে...'
                        : 'সাজেশন দেখানোর জন্য উপরের বাটনে ক্লিক করুন')}
                  </Button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PublicProfilePage
