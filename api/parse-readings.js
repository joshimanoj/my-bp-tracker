const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: 'No transcript provided' });
    }

    const prompt = `
      Extract systolic, diastolic, and heart rate from the following sentence: "${transcript}".
      Return only valid JSON in this exact format:
      {"systolic": number, "diastolic": number, "heartRate": number}
    `;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
      }),
    });

    const data = await response.json();
    console.log('Grok API raw response:', JSON.stringify(data, null, 2));
    const content = data?.choices?.[0]?.message?.content || '{}';
    console.log('Grok API parsed content:', content);

    let parsed;
    try {
      parsed = JSON.parse(content);
      console.log('Parsed Grok API output:', parsed);
    } catch {
      console.error('Failed to parse Grok response:', content);
      return res.status(500).json({ error: 'Could not parse Grok response', raw: content });
    }

    res.status(200).json(parsed);
  } catch (err) {
    console.error('Error calling Grok API:', err);
    res.status(500).json({ error: 'Server error calling Grok API' });
  }
};