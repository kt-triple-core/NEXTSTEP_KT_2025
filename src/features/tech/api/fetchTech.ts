export const fetchTech = async (query: string) => {
  const res = await fetch('/api/ai/tech', {
    method: 'POST',
    body: JSON.stringify({ query }),
  })

  return res.json()
}
