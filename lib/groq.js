// ShiftIn — Groq AI Verification Service
import { GROQ_API_KEY } from '../config.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Convert file to base64 data URL
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Analyze uploaded document using Groq Vision
export async function analyzeDocument(frontImage, backImage = null) {
  const frontBase64 = await fileToBase64(frontImage);
  
  const messages = [
    {
      role: 'system',
      content: `You are an identity document verification assistant for ShiftIn, a student job platform. Analyze the uploaded identity document (Aadhaar card, PAN card, or government ID) and extract key information. Respond ONLY with valid JSON in this exact format:
{
  "is_valid_document": true/false,
  "document_type": "aadhaar/pan/driving_license/other",
  "extracted_name": "Name found on document",
  "document_number_masked": "XXXX-XXXX-1234",
  "confidence_score": 0.0-1.0,
  "issues": ["list of any issues found"],
  "verification_status": "verified/needs_review/rejected",
  "reason": "Brief explanation"
}`
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Please verify this identity document. Check if it appears to be a genuine government-issued ID, extract the name, and assess document quality.' },
        { type: 'image_url', image_url: { url: frontBase64 } }
      ]
    }
  ];

  if (backImage) {
    const backBase64 = await fileToBase64(backImage);
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: 'Here is the back side of the document for additional verification.' },
        { type: 'image_url', image_url: { url: backBase64 } }
      ]
    });
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-4-scout-17b-16e-instruct',
      messages,
      temperature: 0.1,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  // Parse JSON from response
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}
  
  return { is_valid_document: false, verification_status: 'needs_review', reason: 'Could not parse AI response', confidence_score: 0 };
}

// Selfie liveness check (compare selfie with document photo via Groq)
export async function verifySelfie(selfieImage, documentImage) {
  const selfieBase64 = await fileToBase64(selfieImage);
  const docBase64 = await fileToBase64(documentImage);

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'system',
          content: `You are a facial verification assistant. Compare the selfie with the photo on the identity document. Respond ONLY with valid JSON:
{
  "faces_match": true/false,
  "confidence_score": 0.0-1.0,
  "liveness_check": "pass/fail",
  "reason": "Brief explanation"
}`
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Compare this selfie with the document photo. Do they appear to be the same person?' },
            { type: 'image_url', image_url: { url: selfieBase64 } },
            { type: 'image_url', image_url: { url: docBase64 } }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 512
    })
  });

  if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
  
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}
  
  return { faces_match: false, liveness_check: 'fail', confidence_score: 0, reason: 'Could not process' };
}
