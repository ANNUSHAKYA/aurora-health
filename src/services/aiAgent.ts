interface AgentAction {
  type: 'ADD_WATER' | 'ADD_SLEEP' | 'CREATE_HABIT' | 'COMPLETE_HABIT' | 'LOG_MEAL' | 'NONE';
  payload?: any;
}

export interface AgentResponse {
  speechResponse: string;
  action: AgentAction;
  observation?: string;
}

// 1. Local Regex & Rules Parser (Runs out-of-the-box without API key)
export function parseLocalInput(input: string, habitsList: { id: string; name: string }[]): AgentResponse {
  const text = input.toLowerCase().trim();

  // Water Hydration Parsing
  // Matches "drank 500ml", "add 250 ml", "drank 1 liter", "water 300"
  const waterMatch = text.match(/(?:drank|add|log|drink)\s+(\d+(?:\.\d+)?)\s*(ml|l|oz|glass|cup)?/i) || 
                     text.match(/(\d+)\s*(ml|oz|glasses|cups)\s+(?:of\s+)?water/i);
  
  if (waterMatch) {
    let amount = parseFloat(waterMatch[1]);
    let unit = waterMatch[2] ? waterMatch[2].toLowerCase() : 'ml';
    
    if (unit === 'l' || unit === 'liter' || unit === 'liters') {
      amount = amount * 1000;
    } else if (unit === 'glass' || unit === 'glasses' || unit === 'cup' || unit === 'cups') {
      amount = amount * 250; // default 250ml per glass
    } else if (unit === 'oz') {
      amount = Math.round(amount * 29.57); // oz to ml
    }
    
    return {
      speechResponse: `Awesome, I've added ${amount}ml of water to your daily hydration tracking. Keep up the good work!`,
      action: {
        type: 'ADD_WATER',
        payload: { amount }
      },
      observation: amount > 500 ? "Logged a large single intake of water." : undefined
    };
  }

  // Sleep Parsing
  // Matches "slept 7 hours", "log 8.5 hours of sleep", "slept 8h"
  const sleepMatch = text.match(/(?:slept|sleep|logged)\s+(\d+(?:\.\d+)?)\s*(?:hours|hour|h|hrs)?/i) ||
                     text.match(/(\d+(?:\.\d+)?)\s*(?:hours|hour|h|hrs)\s+of\s+sleep/i);
                     
  if (sleepMatch) {
    const duration = parseFloat(sleepMatch[1]);
    const todayStr = new Date().toISOString().split('T')[0];
    
    return {
      speechResponse: `I've logged ${duration} hours of sleep for last night. Let's see how this affects your energy levels today!`,
      action: {
        type: 'ADD_SLEEP',
        payload: {
          duration,
          quality: duration >= 7.5 ? 'Deep' : 'Normal',
          bedtime: '23:00', // default mock values
          wakeupTime: '07:00',
          date: todayStr
        }
      },
      observation: duration < 6 ? "Logged less than 6 hours of sleep." : duration >= 8 ? "Logged healthy restorative sleep." : undefined
    };
  }

  // Habit Creation Parsing
  // Matches "create a habit to meditate every morning", "add habit stretching"
  const createHabitMatch = text.match(/(?:create|add|start|set)\s+(?:a\s+)?habit\s+(?:to\s+)?([a-zA-Z0-9\s]+?)(?:\s+every\s+(morning|afternoon|evening|day))?$/i);
  if (createHabitMatch) {
    const name = createHabitMatch[1].trim();
    const rawTime = createHabitMatch[2] || 'anytime';
    const timeOfDay = ['morning', 'afternoon', 'evening'].includes(rawTime) ? rawTime : 'anytime';
    
    return {
      speechResponse: `Got it! I have created a new daily habit called "${name}" scheduled for the ${timeOfDay}.`,
      action: {
        type: 'CREATE_HABIT',
        payload: {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          frequency: 'daily',
          timeOfDay
        }
      }
    };
  }

  // Habit Completion Parsing
  // Matches "completed meditation", "finished stretching", "did my morning walk"
  for (const habit of habitsList) {
    const habitNameLower = habit.name.toLowerCase();
    if (text.includes(`completed ${habitNameLower}`) || 
        text.includes(`finished ${habitNameLower}`) || 
        text.includes(`did my ${habitNameLower}`) ||
        text.includes(`check off ${habitNameLower}`) ||
        (text.includes(habitNameLower) && (text.includes('done') || text.includes('completed') || text.includes('checked')))) {
      
      return {
        speechResponse: `Fantastic! I've marked your "${habit.name}" habit as completed for today. Consistency is key!`,
        action: {
          type: 'COMPLETE_HABIT',
          payload: { id: habit.id }
        }
      };
    }
  }

  // Meal Logging Parsing
  // Matches "ate eggs for breakfast", "logged salad for lunch", "ate a protein shake"
  const mealMatch = text.match(/(?:ate|logged|had|log|eat)\s+([a-zA-Z\s]+?)\s+(?:for\s+)?(breakfast|lunch|dinner|snack)?$/i);
  if (mealMatch) {
    const mealName = mealMatch[1].trim();
    const rawType = mealMatch[2] || 'Snack';
    const type = (rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase()) as any;
    
    // Simple mock macro estimation
    let calories = 250;
    let protein = 10;
    let carbs = 30;
    let fat = 8;
    
    if (mealName.includes('chicken') || mealName.includes('egg') || mealName.includes('protein')) {
      calories = 380; protein = 35; carbs = 10; fat = 12;
    } else if (mealName.includes('salad') || mealName.includes('vegetable')) {
      calories = 180; protein = 5; carbs = 15; fat = 10;
    } else if (mealName.includes('shake') || mealName.includes('smoothie')) {
      calories = 320; protein = 25; carbs = 40; fat = 5;
    } else if (mealName.includes('pizza') || mealName.includes('burger')) {
      calories = 750; protein = 28; carbs = 80; fat = 35;
    }

    return {
      speechResponse: `I've logged ${mealName} as a ${type} for today. That's about ${calories} calories added.`,
      action: {
        type: 'LOG_MEAL',
        payload: {
          type,
          name: mealName.charAt(0).toUpperCase() + mealName.slice(1),
          calories,
          protein,
          carbs,
          fat
        }
      }
    };
  }

  // General conversation response
  return {
    speechResponse: "I'm Aurora, your health companion. You can ask me to log your water intake, update sleep hours, check off habits, or review your goals. Try saying 'I drank 500ml water' or 'I slept 8 hours last night'!",
    action: { type: 'NONE' }
  };
}

// 2. Gemini API Live Parser (Runs when user adds a Gemini Key)
export async function parseGeminiInput(
  input: string,
  apiKey: string,
  stateSummary: {
    userName: string;
    waterGoal: number;
    currentWater: number;
    habits: { id: string; name: string; isCompleted: boolean }[];
    sleepAverage: number;
  }
): Promise<AgentResponse> {
  const systemInstruction = `
You are Aurora, an intelligent, personal, and supportive health coach. 
The user will interact with you using voice or text. You have the ability to execute actions in their tracking system based on their message.

Current User State Context:
- User Name: ${stateSummary.userName || 'User'}
- Hydration: ${stateSummary.currentWater}ml logged out of ${stateSummary.waterGoal}ml goal today.
- Habits: ${JSON.stringify(stateSummary.habits)}
- Average Sleep: ${stateSummary.sleepAverage} hours.

Analyze the user's message and determine if they are stating a tracking action.
You can execute these actions:
1. ADD_WATER: If they drank water. Payload format: { amount: number } (amount in ml).
2. ADD_SLEEP: If they state how long they slept. Payload format: { duration: number, quality: "Restless"|"Normal"|"Deep", bedtime: "HH:MM", wakeupTime: "HH:MM", date: "YYYY-MM-DD" }. Duration must be a number in hours. Populate quality, bedtime, wakeupTime, date with reasonable values if they aren't explicitly mentioned (today's date in YYYY-MM-DD format).
3. CREATE_HABIT: If they want to start a new habit. Payload format: { name: string, frequency: "daily"|"weekly", timeOfDay: "morning"|"afternoon"|"evening"|"anytime" }.
4. COMPLETE_HABIT: If they completed a habit. Payload format: { id: string } (id must match one of the active habits in the user's habits list).
5. LOG_MEAL: If they logged eating something. Payload format: { type: "Breakfast"|"Lunch"|"Dinner"|"Snack", name: string, calories: number, protein: number, carbs: number, fat: number }. Perform a reasonable macro-nutrient estimation for the food they mention.
6. NONE: If it's a general question or greeting.

You MUST respond strictly in the following JSON format:
{
  "speechResponse": "A supportive, voice-friendly response to speak to the user, acknowledging the action or answering their question.",
  "action": {
    "type": "ADD_WATER" | "ADD_SLEEP" | "CREATE_HABIT" | "COMPLETE_HABIT" | "LOG_MEAL" | "NONE",
    "payload": { ... }
  },
  "observation": "An optional memory log observation starting with 'User...' if you notice any habit patterns (e.g. 'User likes to drink tea in the morning'). Limit to 1 sentence."
}

Ensure the response is valid JSON only. Do not wrap it in markdown code blocks.
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: input }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API HTTP Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      throw new Error("Empty candidate response from Gemini API");
    }

    const parsedResponse = JSON.parse(resultText) as AgentResponse;
    return parsedResponse;
  } catch (error) {
    console.error("Failed to parse Gemini output, falling back to local parsing:", error);
    // Fallback to local parsing on network/API failure
    return parseLocalInput(input, stateSummary.habits);
  }
}
