const Groq = require('groq-sdk')
const tools = require('./tools')
require('dotenv').config()

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Tool definitions — tells the LLM what tools exist and when to use them
const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'log_water',
      description: 'Log water intake for the user. Use when user mentions drinking water.',
      parameters: {
        type: 'object',
        properties: {
          amount_ml: {
            type: 'number',
            description: 'Amount of water in milliliters. Convert cups/glasses to ml (1 glass = 250ml)'
          }
        },
        required: ['amount_ml']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'log_sleep',
      description: 'Log sleep duration. Use when user mentions how long they slept.',
      parameters: {
        type: 'object',
        properties: {
          duration_hours: {
            type: 'number',
            description: 'Sleep duration in hours'
          },
          quality: {
            type: 'string',
            enum: ['poor', 'fair', 'good', 'excellent'],
            description: 'Sleep quality if mentioned'
          }
        },
        required: ['duration_hours']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_habit',
      description: 'Create a new habit for the user.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name of the habit' },
          time_of_day: {
            type: 'string',
            enum: ['morning', 'afternoon', 'evening', 'anytime'],
            description: 'When to do the habit'
          },
          icon: { type: 'string', description: 'Emoji icon for the habit' }
        },
        required: ['name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'complete_habit',
      description: 'Mark a habit as completed today.',
      parameters: {
        type: 'object',
        properties: {
          habit_name: { type: 'string', description: 'Name or partial name of the habit' }
        },
        required: ['habit_name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_health_summary',
      description: 'Get the user current health stats — water, sleep, habits. Use when user asks how they are doing.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'log_nutrition',
      description: 'Log a meal or food intake for the user.',
      parameters: {
        type: 'object',
        properties: {
          meal_type: {
            type: 'string',
            enum: ['breakfast', 'lunch', 'dinner', 'snack'],
            description: 'Type of meal'
          },
          description: { type: 'string', description: 'What the user ate' },
          calories: { type: 'number', description: 'Estimated calories if mentioned' }
        },
        required: ['meal_type', 'description']
      }
    }
  }
]

// System prompt — Aurora's personality
const SYSTEM_PROMPT = `You are Aurora, a warm and intelligent personal health companion.
You help users track their hydration, sleep, habits, and nutrition.
You are encouraging, concise, and personal.
When users tell you about their health activities, use the available tools to log them.
After taking an action, respond briefly and warmly — confirm what you did and add a short insight.
Never be clinical or robotic.
IMPORTANT: Keep ALL responses under 2 sentences. They will be read aloud via text-to-speech.
Never use markdown, lists, or special characters in your responses.
Always call get_health_summary first if the user asks how they are doing.`

async function runAuroraAgent({ message, user_id, history = [] }) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: message }
  ]

  // First LLM call — decide what to do
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    tools: TOOL_DEFINITIONS,
    tool_choice: 'auto',
    max_tokens: 1024
  })

  const choice = response.choices[0]
  const assistantMessage = choice.message

  // If LLM wants to call a tool
  if (assistantMessage.tool_calls?.length) {
    const toolCall = assistantMessage.tool_calls[0]
    const toolName = toolCall.function.name
    const toolArgs = JSON.parse(toolCall.function.arguments)

    // Always inject user_id into tool args
    toolArgs.user_id = user_id

    // Execute the tool
    let toolResult
    if (tools[toolName]) {
      toolResult = await tools[toolName](toolArgs)
    } else {
      toolResult = { success: false, message: 'Tool not found' }
    }

    // Second LLM call — generate human response based on tool result
    const finalResponse = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        ...messages,
        assistantMessage,
        {
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult)
        }
      ],
      max_tokens: 512
    })

    return {
      reply: finalResponse.choices[0].message.content,
      tool_used: toolName,
      tool_result: toolResult
    }
  }

  // No tool needed — just a conversational reply
  return {
    reply: assistantMessage.content,
    tool_used: null,
    tool_result: null
  }
}

module.exports = { runAuroraAgent }
