// src/app/api/extract/route.js
import { OpenAI } from "openai";

import { OpenAI } from "openai";

export const POST = async (req) => {
  const formData = await req.formData();
  const file = formData.get('htmlFile');
  const htmlContent = await file.text();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `
You are a music playlist extraction assistant. Given the following HTML content, extract a clean list of music track titles and artist names.
Return ONLY the list, one entry per line, in the format "Artist - Title". 
Do not include metadata, album names, track numbers or extra info.

HTML:
${htmlContent}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  const result = completion.choices[0].message.content.trim().split("\n");

  return new Response(JSON.stringify({ tracks: result }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
};


  const prompt = `
You are a music playlist extraction assistant. Given the following HTML content, extract a clean list of music track titles and artist names.
Return ONLY the list, one entry per line, in the format "Artist - Title". 
Do not include metadata, album names, track numbers or extra info.

HTML:
${htmlContent}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  const result = completion.choices[0].message.content.trim().split("\n");

  return new Response(JSON.stringify({ tracks: result }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
}
