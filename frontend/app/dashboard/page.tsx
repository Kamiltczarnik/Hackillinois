"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, CreditCard, User, Bell, LogOut, Home, BarChart4, Send, Clock } from "lucide-react"
import VoiceAssistant from "@/components/voice-assistant"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"

// Define types for our user data
type Account = {
  id: string
  type: string
  nickname: string
  balance: number
  rewards: number
  account_number: string
}

type Transaction = {
  transaction_id: string
  type: string
  merchant_name: string
  amount: number
  date: string
  description: string
}

type UserData = {
  customer_id: string
  first_name: string
  last_name: string
  accounts: Account[]
  transactions: Transaction[]
}

export default function Dashboard() {
  const [greeting, setGreeting] = useState("Good day")
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState("User")
  const router = useRouter()

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")
    
    // Load user data from localStorage
    const storedUserData = localStorage.getItem("userData")
    const customerId = localStorage.getItem("customerId")
    const username = localStorage.getItem("username")
    
    if (username) {
      setUserName(username)
    }
    
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData)
        setUserData(parsedData)
        if (parsedData.first_name) {
          setUserName(parsedData.first_name)
        }
        setIsLoading(false)
      } catch (e) {
        console.error("Error parsing stored user data:", e)
        if (customerId) {
          fetchUserData(customerId)
        }
      }
    } else if (customerId) {
      // If we have a customer ID but no data, fetch it
      fetchUserData(customerId)
    } else {
      // No customer ID, redirect to login
      router.push("/")
    }
  }, [router])
  
  const fetchUserData = async (customerId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:8000/api/user/${customerId}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch user data")
      }
      
      const data = await response.json()
      setUserData(data)
      if (data.first_name) {
        setUserName(data.first_name)
      }
      localStorage.setItem("userData", JSON.stringify(data))
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleLogout = () => {
    localStorage.removeItem("customerId")
    localStorage.removeItem("userData")
    localStorage.removeItem("username")
    router.push("/")
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">
              LIRA
            </span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/dashboard" className="text-sm font-medium hover:underline underline-offset-4">
              Dashboard
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Accounts
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Payments
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Log out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <h1 className="text-3xl font-bold">
                  {greeting}, {userName}
                </h1>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(
                          userData?.accounts.reduce((total, account) => total + account.balance, 0) || 0
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">+2.5% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Spending</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(1250)}</div>
                      <p className="text-xs text-muted-foreground">-4.3% from last month</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Your Accounts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {userData?.accounts.map((account) => (
                      <div key={account.id} className="flex justify-between items-center border-b pb-2">
                        <div className="flex items-center gap-2">
                          {account.type === "Checking" ? (
                            <Home className="h-4 w-4 text-muted-foreground" />
                          ) : account.type === "Credit Card" ? (
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <BarChart4 className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span>{account.nickname || account.type}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(account.balance)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Tabs defaultValue="transactions" className="mt-6">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming Payments</TabsTrigger>
                  </TabsList>
                  <TabsContent value="transactions" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      {userData?.transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.transaction_id} className="flex items-center justify-between border-b pb-4">
                          <div className="flex items-center space-x-4">
                            <div className="rounded-full bg-primary/10 p-2">
                              {transaction.type === "merchant" ? (
                                <CreditCard className="h-4 w-4 text-primary" />
                              ) : (
                                <Send className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{transaction.merchant_name || transaction.description}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                            </div>
                          </div>
                          <div className="text-sm font-medium">
                            {transaction.type === "withdrawal" ? "-" : ""}
                            {formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="upcoming" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center space-x-4">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Credit Card Payment</p>
                          <p className="text-xs text-muted-foreground">Due in 7 days</p>
                        </div>
                      </div>
                      <div className="text-sm font-medium">{formatCurrency(350)}</div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <div className="md:w-1/3">
                <VoiceAssistant userData={userData} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

