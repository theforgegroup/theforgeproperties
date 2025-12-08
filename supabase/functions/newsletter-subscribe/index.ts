// Follow this setup guide to deploy: https://supabase.com/docs/guides/functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const MAILERLITE_API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiMGZmMmJmODZiM2FkY2NiM2UyNzc0ODBiZmYxMGRiNWQxMDQ3NWFhODAzZWVkMWYwNDg5NjkzN2YwYTJlMTc4NjI1YTk4ZmJhZTMyMzU5YTkiLCJpYXQiOjE3NjUyMzAyMTAuMzM3NjY3LCJuYmYiOjE3NjUyMzAyMTAuMzM3NjY5LCJleHAiOjQ5MjA5MDM4MTAuMzMzNjMyLCJzdWIiOiIxOTg4MjIyIiwic2NvcGVzIjpbXX0.DdRJpwHf2kCfAUUza8Os_rgWJ9SdfXSk3oajGljbKkHwX-3IV1z4udpbj9YJtI2a4KpHoG9NZCHXHENRpaP7NVbNdHT9m4yjSiVlLjuXWQjry4lUBgu5WaIsXeoipJ9HSX0x4bBDeUtPCLJSOss-MjTPJ-AuvoQ1Ntow4Udb8JUbxosZ2Fs3FppjjtTFhSQZ0P9qZk6LVuJFq2RHKtCTUdL2dWQBoPVKjsPvOaAefJ-kBSCwryiP2Wr6U5lnzROx2LrTAPqVRAWkQHt-5DZTsc9vwSaWCnZ1Twg87NXsVUSSRb3hvG2cnmfOuJYqI82TGoP6OuIN_6e0jzl03odlxkiiygUPgzMHAdHmrTE1RP9c_53QgxPza_iVVC4HvFDj_YZErWKPYVFUjjRjFzUAwpJzdSaDMNkkOh5bryWm5dx9qGcFxb-2UT4WVccL0W-hOFHbZEXoMoHmzKNMeqnEiJFWhk8HcJE0iGwcKU3RQbYkJBHcS_lWcOFqbflc6wiHjiisWXRwnJK_Jmi7JKlIkTOTYtM4dDM7bht3WOMHSCQTCwa4ntaF4KfR9oET5PMxTmcNbXZF22u8zN8TMZCf4ItUjAwQv2d9Om1rR-G4jrPTYzQG39zneATO3-Uqhq8oAks1q8IzvIWyXmmx4nk__aqzRWJLTEYHhxezhSbFaPA';

serve(async (req) => {
  // Handle CORS (Cross-Origin Resource Sharing)
  // This allows your frontend to call this function without browser errors
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Call MailerLite API from the server side
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`
      },
      body: JSON.stringify({
        email: email,
        // groups: ['YOUR_GROUP_ID'], // Optional: Add Group ID here if provided
        status: 'active'
      })
    })

    const data = await response.json()

    // Return success to frontend
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})