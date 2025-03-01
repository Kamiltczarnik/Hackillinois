"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mic, MicOff, Send, MessageSquare, Volume2, VolumeX, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "Hello! I'm your AI banking assistant. How can I help you today?", isUser: false },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Speech recognition setup
  const recognitionRef = useRef<any>(null)

  // Speech synthesis setup
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null

  useEffect(() => {
    // Initialize speech recognition if available in the browser
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex
        const result = event.results[current][0].transcript
        setTranscript(result)
      }

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start()
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synth) {
        synth.cancel()
      }
    }
  }, [isListening, synth])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false)
      recognitionRef.current?.stop()

      if (transcript) {
        handleUserMessage(transcript)
        setTranscript("")
      }
    } else {
      setIsListening(true)
      recognitionRef.current?.start()
    }
  }

  const toggleSpeech = () => {
    setIsSpeaking(!isSpeaking)
    if (isSpeaking && synth) {
      synth.cancel()
    }
  }

  const speakResponse = (text: string) => {
    if (synth && isSpeaking) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      synth.speak(utterance)
    }
  }

  const handleUserMessage = (text: string) => {
    if (!text.trim()) return

    // Add user message
    setMessages((prev) => [...prev, { text, isUser: true }])
    setIsProcessing(true)

    // Simulate AI response based on user input
    setTimeout(() => {
      let response =
        "I'm sorry, I don't understand that query. Can you try asking something about your accounts, transactions, or banking services?"

      const lowerText = text.toLowerCase()

      if (lowerText.includes("balance") || lowerText.includes("how much") || lowerText.includes("checking account")) {
        response =
          "Your current checking account balance is $5,231.89. Your savings account has $12,000.00. Is there anything specific you'd like to know about your accounts?"
      } else if (
        lowerText.includes("transfer") ||
        lowerText.includes("send money") ||
        lowerText.includes("move money")
      ) {
        response =
          "I can help you set up a transfer. How much would you like to transfer and to which account? For example, you can say 'Transfer $100 from checking to savings.'"
      } else if (lowerText.includes("spend") || lowerText.includes("transaction") || lowerText.includes("recent")) {
        response =
          "Your most recent transactions include: $34.52 at Amazon on March 1st, $1,200.00 for rent on February 28th, and a salary deposit of $3,500.00 on February 25th. Would you like to see more transactions?"
      } else if (lowerText.includes("credit") || lowerText.includes("card") || lowerText.includes("payment due")) {
        response =
          "Your credit card has an available balance of $7,000.00. Your next payment of $350.00 is due on March 15th. Would you like me to help you schedule this payment?"
      } else if (lowerText.includes("hello") || lowerText.includes("hi") || lowerText.includes("hey")) {
        response =
          "Hello! I'm your AI banking assistant. I can help you check balances, make transfers, review transactions, and manage your accounts. What would you like to do today?"
      } else if (
        lowerText.includes("help") ||
        lowerText.includes("what can you do") ||
        lowerText.includes("features")
      ) {
        response =
          "I can help you with many banking tasks! You can ask me to check your account balances, make transfers between accounts, review recent transactions, schedule payments, or provide insights about your spending habits. Just ask in natural language, and I'll assist you."
      } else if (lowerText.includes("thank") || lowerText.includes("thanks")) {
        response =
          "You're welcome! I'm here to help with any banking questions or tasks you have. Is there anything else you'd like assistance with today?"
      } else if (lowerText.includes("bill") || lowerText.includes("payment") || lowerText.includes("pay")) {
        response =
          "I can help you pay bills. Your upcoming payments include rent ($1,200.00) due on March 31st and a credit card payment ($350.00) due on March 15th. Would you like to schedule either of these payments?"
      } else if (lowerText.includes("saving") || lowerText.includes("invest") || lowerText.includes("goal")) {
        response =
          "Based on your current spending and saving patterns, you could increase your monthly savings by about $200 by reducing discretionary spending. Would you like me to suggest a savings plan to help you reach your financial goals?"
      }

      setMessages((prev) => [...prev, { text: response, isUser: false }])
      setIsProcessing(false)
      speakResponse(response)
    }, 1500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleUserMessage(inputMessage)
    setInputMessage("")
  }

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-4 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center text-xl">
          <MessageSquare className="mr-2 h-5 w-5" />
          AI Banking Voice Assistant
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={toggleSpeech} className="h-8 w-8">
            {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="sr-only">{isSpeaking ? "Mute voice" : "Enable voice"}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] overflow-y-auto space-y-4 mb-4 p-4 bg-muted/30 rounded-lg">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-3 text-sm shadow-sm",
                  message.isUser ? "bg-primary text-primary-foreground" : "bg-background border",
                )}
              >
                {message.text}
              </div>
            </div>
          ))}
          {transcript && (
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-lg px-4 py-3 text-sm bg-primary/50 text-primary-foreground shadow-sm">
                {transcript}
              </div>
            </div>
          )}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="rounded-lg px-4 py-3 text-sm bg-background border shadow-sm flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing your request...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full space-y-4">
          <div className="relative w-full h-16 flex items-center justify-center">
            <Button
              variant={isListening ? "destructive" : "default"}
              size="lg"
              onClick={toggleListening}
              className={cn(
                "absolute rounded-full w-16 h-16 flex items-center justify-center transition-all",
                isListening && "animate-pulse",
              )}
            >
              {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              <span className="sr-only">{isListening ? "Stop listening" : "Start listening"}</span>
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isListening}
              className="flex-1"
            />
            <Button type="submit" disabled={isListening || !inputMessage.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </div>
      </CardFooter>
    </Card>
  )
}

