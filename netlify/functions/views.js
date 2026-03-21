// Netlify Function to proxy view counter API (avoids CORS)
export default async () => {
  try {
    const response = await fetch('https://api.counterapi.dev/v2/gdppercapitacom/gdppercapita-pageviews/up', {
      headers: {
        'Authorization': 'Bearer ut_93yb2sjFcWhLgyRKbcoxjpCLePIQaexQXpuwI4QY'
      }
    });
    const result = await response.json();

    // Extract count from response
    const count = result.data?.up_count || 0;

    return new Response(JSON.stringify({ count }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch view count' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
