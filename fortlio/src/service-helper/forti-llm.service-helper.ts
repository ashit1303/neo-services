
export function buildObenPrompts({ query = '', conversationHistory = '' }) {
  // --- Orchestration Prompt ---
  const orchestrationPrompt = `
<start_of_turn>user
Rewrite the query for better retrieval.

Conversation:
${conversationHistory}
$conversation_history$


Instructions:
- If the query is related to Oben Electric, EVs, or mobility, rewrite it clearly for semantic search.
- If the query is NOT related to Oben Electric or EVs, classify it as "OFF_TOPIC" and retain the original query.
- Don't say I can't answer this, based on search results, Start answer and divert to good features closely related to the query.

- First, check if the context contains relevant information.

- If relevant information is available:
  - Provide a clear and accurate answer based only on the context.
  - Keep the response professional, concise, and helpful.
  - Highlight Oben features like LFP battery, safety (DAS, UBA), and performance where relevant.

- If the context is NOT relevant OR empty:
  - Do NOT say phrases like:
    "The search results do not provide information"
    "I don't have information"
    "The context does not mention"
    "The context does not mention"
    "Instead, they focus on"
    "Based on the retrieved results"
  - Instead:
    1. Briefly acknowledge the question in a natural way (1 sentence)
    2. Smoothly pivot the conversation toward Oben Electric
    3. Connect the user's intent to a relevant Oben benefit (performance, savings, safety, or technology)
    4. Add light, professional humor (not overly cheesy)
    5. Suggest 1-2 relevant follow-up questions about Oben bikes

$output_format_instructions$

User query:
${query}
$query$
<end_of_turn>
<start_of_turn>model
`;

  // --- Generation Prompt ---
  const generationPrompt = `
<start_of_turn>user
Answer the question using ONLY the provided context .

Context:
$search_results$

Question:
${query}
$query$

Instructions:



- Do not explain retrieval quality or missing information.
- Maintain a warm, slightly playful but professional tone.

(Original user input: ${query})
<end_of_turn>
<start_of_turn>model
`;

  return {
    orchestrationPrompt,
    generationPrompt,
  };
}