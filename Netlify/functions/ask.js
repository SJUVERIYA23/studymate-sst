exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { prompt } = JSON.parse(event.body || "{}");
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "GROQ_API_KEY is missing in Netlify Environment Variables!" })
      };
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are an elite CBSE Class 10 SST Board Examiner. Provide surgical, high-yield revision for the requested chapter using strict NCERT terminology. BOLD all key dates, terms, and names.

Format:
### 📌 1. HIGH-PROBABILITY PYQs
Give 3 questions + bulleted answers with bold keywords.

### 🔍 2. HIDDEN NCERT DETAILS (Don't Lose These Marks!)
Give 3 specific box/map/date details often skipped.

### ⚠️ 3. THE COMMON EXAM TRAP
Identify 1 common error and the exact fix.`
          },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status || 400,
        body: JSON.stringify({ error: data.error?.message || "Error from Groq API" })
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message || "Server Error" }) 
    };
  }
};
