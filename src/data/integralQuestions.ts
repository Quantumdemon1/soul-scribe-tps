// Cognitive Development Questions for Integral Theory Assessment
// Based on Ken Wilber's Integral Theory and Spiral Dynamics

export interface IntegralQuestion {
  id: number;
  question: string;
  options: {
    text: string;
    scores: {
      beige: number;
      purple: number;
      red: number;
      blue: number;
      orange: number;
      green: number;
      yellow: number;
      turquoise: number;
      coral: number;
    };
  }[];
  category: 'meta-cognitive' | 'complexity' | 'perspective-taking' | 'authority' | 'systems-thinking' | 'paradox-tolerance';
}

export const INTEGRAL_QUESTIONS: IntegralQuestion[] = [
  {
    id: 1,
    question: "When facing a complex problem, how do you typically approach it?",
    category: "systems-thinking",
    options: [
      {
        text: "I react instinctively to survive or get basic needs met",
        scores: { beige: 5, purple: 1, red: 0, blue: 0, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I rely on group traditions and ancestral wisdom",
        scores: { beige: 1, purple: 5, red: 1, blue: 0, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I act quickly and decisively to get what I need",
        scores: { beige: 1, purple: 1, red: 5, blue: 1, orange: 2, green: 1, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I follow established procedures and rules",
        scores: { beige: 0, purple: 1, red: 1, blue: 5, orange: 2, green: 1, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I analyze the data and create a strategic plan",
        scores: { beige: 0, purple: 0, red: 1, blue: 2, orange: 5, green: 1, yellow: 1, turquoise: 0, coral: 0 }
      },
      {
        text: "I consider how it affects everyone involved and seek consensus",
        scores: { beige: 0, purple: 0, red: 0, blue: 1, orange: 2, green: 5, yellow: 2, turquoise: 1, coral: 0 }
      },
      {
        text: "I look at multiple perspectives and integrate different approaches",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 1, green: 2, yellow: 5, turquoise: 2, coral: 1 }
      },
      {
        text: "I connect with deeper patterns and universal principles at play",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 1, yellow: 2, turquoise: 5, coral: 2 }
      },
      {
        text: "I transcend all approaches and work from pure consciousness",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 0, yellow: 1, turquoise: 2, coral: 5 }
      }
    ]
  },
  {
    id: 2,
    question: "When people disagree with you, what is your typical response?",
    category: "perspective-taking",
    options: [
      {
        text: "I focus on basic survival and avoid conflict",
        scores: { beige: 5, purple: 1, red: 0, blue: 0, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I defer to tribal elders or group consensus",
        scores: { beige: 1, purple: 5, red: 1, blue: 1, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I assert my position strongly to make sure I'm heard",
        scores: { beige: 1, purple: 1, red: 5, blue: 2, orange: 1, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I refer to established rules or authorities to resolve it",
        scores: { beige: 0, purple: 1, red: 1, blue: 5, orange: 1, green: 1, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I present logical arguments and evidence to prove my point",
        scores: { beige: 0, purple: 0, red: 1, blue: 2, orange: 5, green: 1, yellow: 1, turquoise: 0, coral: 0 }
      },
      {
        text: "I try to understand their perspective and find common ground",
        scores: { beige: 0, purple: 0, red: 0, blue: 1, orange: 2, green: 5, yellow: 2, turquoise: 1, coral: 0 }
      },
      {
        text: "I explore how both viewpoints might be valid in different contexts",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 1, green: 2, yellow: 5, turquoise: 2, coral: 1 }
      },
      {
        text: "I see it as an opportunity to transcend the apparent conflict",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 1, yellow: 2, turquoise: 5, coral: 2 }
      },
      {
        text: "I embrace the paradox and find unity beyond all positions",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 0, yellow: 1, turquoise: 2, coral: 5 }
      }
    ]
  },
  {
    id: 3,
    question: "How do you think about rules and authority in society?",
    category: "authority",
    options: [
      {
        text: "I focus on immediate needs, rules are irrelevant",
        scores: { beige: 5, purple: 1, red: 1, blue: 0, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I follow sacred traditions and tribal customs",
        scores: { beige: 1, purple: 5, red: 1, blue: 1, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "Rules are obstacles to getting what I want",
        scores: { beige: 1, purple: 1, red: 5, blue: 0, orange: 1, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "Rules provide necessary order and should be followed",
        scores: { beige: 0, purple: 1, red: 1, blue: 5, orange: 1, green: 1, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "Rules are tools that should be efficient and rational",
        scores: { beige: 0, purple: 0, red: 1, blue: 2, orange: 5, green: 1, yellow: 1, turquoise: 0, coral: 0 }
      },
      {
        text: "Rules should be fair and inclusive of all perspectives",
        scores: { beige: 0, purple: 0, red: 0, blue: 1, orange: 2, green: 5, yellow: 2, turquoise: 1, coral: 0 }
      },
      {
        text: "Rules emerge naturally from understanding complex systems",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 1, green: 2, yellow: 5, turquoise: 2, coral: 1 }
      },
      {
        text: "Rules reflect deeper universal principles that transcend culture",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 1, yellow: 2, turquoise: 5, coral: 2 }
      },
      {
        text: "All rules are manifestations of cosmic consciousness",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 0, yellow: 1, turquoise: 2, coral: 5 }
      }
    ]
  },
  {
    id: 4,
    question: "When encountering contradictory information, how do you respond?",
    category: "paradox-tolerance",
    options: [
      {
        text: "I ignore it if it doesn't affect my immediate survival",
        scores: { beige: 5, purple: 1, red: 0, blue: 0, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I consult tribal wisdom and ancestral knowledge",
        scores: { beige: 1, purple: 5, red: 1, blue: 1, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I go with what feels right or serves my immediate needs",
        scores: { beige: 1, purple: 1, red: 5, blue: 1, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I look for the correct answer according to established sources",
        scores: { beige: 0, purple: 1, red: 1, blue: 5, orange: 2, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I analyze the evidence to determine which is more logical",
        scores: { beige: 0, purple: 0, red: 0, blue: 2, orange: 5, green: 1, yellow: 1, turquoise: 0, coral: 0 }
      },
      {
        text: "I explore how different perspectives might all have validity",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 2, green: 5, yellow: 2, turquoise: 1, coral: 0 }
      },
      {
        text: "I look for how the contradictions might be part of a larger pattern",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 1, green: 2, yellow: 5, turquoise: 2, coral: 1 }
      },
      {
        text: "I see contradiction as pointing to a deeper unity beyond concepts",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 1, yellow: 2, turquoise: 5, coral: 2 }
      },
      {
        text: "I embrace all contradictions as expressions of infinite consciousness",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 0, yellow: 1, turquoise: 2, coral: 5 }
      }
    ]
  },
  {
    id: 5,
    question: "What motivates you most in making important life decisions?",
    category: "meta-cognitive",
    options: [
      {
        text: "Meeting basic survival needs and staying safe",
        scores: { beige: 5, purple: 1, red: 1, blue: 0, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "Honoring tradition and staying connected to my community",
        scores: { beige: 1, purple: 5, red: 1, blue: 1, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "Getting what I want when I want it",
        scores: { beige: 1, purple: 1, red: 5, blue: 1, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "Doing what's right according to my values and traditions",
        scores: { beige: 0, purple: 1, red: 1, blue: 5, orange: 1, green: 1, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "Achieving success and accomplishing my goals",
        scores: { beige: 0, purple: 0, red: 1, blue: 2, orange: 5, green: 1, yellow: 1, turquoise: 0, coral: 0 }
      },
      {
        text: "Creating harmony and helping others feel included",
        scores: { beige: 0, purple: 0, red: 0, blue: 1, orange: 2, green: 5, yellow: 2, turquoise: 1, coral: 0 }
      },
      {
        text: "Understanding how everything connects and integrating wisdom",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 1, green: 2, yellow: 5, turquoise: 2, coral: 1 }
      },
      {
        text: "Aligning with cosmic purpose and universal consciousness",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 1, yellow: 2, turquoise: 5, coral: 2 }
      },
      {
        text: "Manifesting pure awareness in all actions",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 0, yellow: 1, turquoise: 2, coral: 5 }
      }
    ]
  },
  {
    id: 6,
    question: "How do you prefer to learn new concepts?",
    category: "complexity",
    options: [
      {
        text: "Through instinct and basic trial and error",
        scores: { beige: 5, purple: 2, red: 1, blue: 0, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "From stories, rituals, and ancestral wisdom",
        scores: { beige: 1, purple: 5, red: 1, blue: 1, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "Through direct experience and trial and error",
        scores: { beige: 1, purple: 2, red: 5, blue: 2, orange: 1, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "By following established curricula and proven methods",
        scores: { beige: 0, purple: 1, red: 1, blue: 5, orange: 2, green: 1, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "Through systematic study and logical analysis",
        scores: { beige: 0, purple: 0, red: 0, blue: 2, orange: 5, green: 1, yellow: 1, turquoise: 0, coral: 0 }
      },
      {
        text: "In groups where we can share different perspectives",
        scores: { beige: 0, purple: 0, red: 0, blue: 1, orange: 2, green: 5, yellow: 2, turquoise: 1, coral: 0 }
      },
      {
        text: "By integrating multiple frameworks and seeing connections",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 1, green: 2, yellow: 5, turquoise: 2, coral: 1 }
      },
      {
        text: "Through contemplation and direct intuitive understanding",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 1, yellow: 2, turquoise: 5, coral: 2 }
      },
      {
        text: "Through pure awareness beyond all concepts",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 0, yellow: 1, turquoise: 2, coral: 5 }
      }
    ]
  },
  {
    id: 7,
    question: "When considering global issues like climate change, what's your primary focus?",
    category: "systems-thinking",
    options: [
      {
        text: "I focus on immediate survival concerns",
        scores: { beige: 5, purple: 2, red: 1, blue: 0, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "How it affects my tribe and ancestral lands",
        scores: { beige: 1, purple: 5, red: 2, blue: 0, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "How it affects me and my immediate circle",
        scores: { beige: 1, purple: 2, red: 5, blue: 2, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "What authorities and institutions say we should do",
        scores: { beige: 0, purple: 1, red: 1, blue: 5, orange: 1, green: 1, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "Finding practical, efficient solutions",
        scores: { beige: 0, purple: 0, red: 0, blue: 2, orange: 5, green: 2, yellow: 1, turquoise: 0, coral: 0 }
      },
      {
        text: "Ensuring everyone has a voice and feels heard",
        scores: { beige: 0, purple: 0, red: 0, blue: 1, orange: 2, green: 5, yellow: 2, turquoise: 1, coral: 0 }
      },
      {
        text: "Understanding the complex interconnections across all systems",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 1, green: 2, yellow: 5, turquoise: 2, coral: 1 }
      },
      {
        text: "Seeing it as part of a larger evolutionary transformation",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 1, yellow: 2, turquoise: 5, coral: 2 }
      },
      {
        text: "Recognizing it as consciousness awakening to itself through crisis",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 0, yellow: 1, turquoise: 2, coral: 5 }
      }
    ]
  },
  {
    id: 8,
    question: "How do you handle situations where you need to make decisions with incomplete information?",
    category: "complexity",
    options: [
      {
        text: "I react based on immediate survival instincts",
        scores: { beige: 5, purple: 1, red: 1, blue: 0, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I rely on traditional wisdom and group guidance",
        scores: { beige: 1, purple: 5, red: 1, blue: 1, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I trust my gut and act quickly",
        scores: { beige: 1, purple: 1, red: 5, blue: 1, orange: 1, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I seek guidance from established authorities or precedents",
        scores: { beige: 0, purple: 1, red: 1, blue: 5, orange: 1, green: 1, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I gather as much data as possible and do risk analysis",
        scores: { beige: 0, purple: 0, red: 1, blue: 2, orange: 5, green: 1, yellow: 1, turquoise: 0, coral: 0 }
      },
      {
        text: "I consult with others to get diverse perspectives",
        scores: { beige: 0, purple: 0, red: 0, blue: 1, orange: 2, green: 5, yellow: 2, turquoise: 1, coral: 0 }
      },
      {
        text: "I accept uncertainty as natural and work with multiple possibilities",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 1, green: 2, yellow: 5, turquoise: 2, coral: 1 }
      },
      {
        text: "I trust in the larger intelligence of the universe",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 1, yellow: 2, turquoise: 5, coral: 2 }
      },
      {
        text: "I rest in pure awareness where all possibilities exist",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 0, yellow: 1, turquoise: 2, coral: 5 }
      }
    ]
  },
  {
    id: 9,
    question: "What does 'being successful' mean to you?",
    category: "meta-cognitive",
    options: [
      {
        text: "Surviving and meeting basic needs",
        scores: { beige: 5, purple: 1, red: 1, blue: 0, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "Being accepted and valued by my community",
        scores: { beige: 1, purple: 5, red: 1, blue: 1, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "Having power and getting what I want",
        scores: { beige: 1, purple: 1, red: 5, blue: 1, orange: 1, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "Living according to proper values and earning respect",
        scores: { beige: 0, purple: 1, red: 1, blue: 5, orange: 1, green: 1, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "Achieving my goals and advancing in my career",
        scores: { beige: 0, purple: 0, red: 1, blue: 2, orange: 5, green: 1, yellow: 1, turquoise: 0, coral: 0 }
      },
      {
        text: "Contributing to community wellbeing and social justice",
        scores: { beige: 0, purple: 0, red: 0, blue: 1, orange: 2, green: 5, yellow: 2, turquoise: 1, coral: 0 }
      },
      {
        text: "Understanding my place in the larger web of existence",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 1, green: 2, yellow: 5, turquoise: 2, coral: 1 }
      },
      {
        text: "Realizing my unity with all of consciousness",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 1, yellow: 2, turquoise: 5, coral: 2 }
      },
      {
        text: "Being pure awareness expressing itself as life",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 0, yellow: 1, turquoise: 2, coral: 5 }
      }
    ]
  },
  {
    id: 10,
    question: "How do you typically respond to criticism?",
    category: "perspective-taking",
    options: [
      {
        text: "I focus on physical safety and protection",
        scores: { beige: 5, purple: 1, red: 1, blue: 0, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I check with my tribe about proper response",
        scores: { beige: 1, purple: 5, red: 1, blue: 1, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I defend myself or attack back",
        scores: { beige: 1, purple: 2, red: 5, blue: 2, orange: 1, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I check if they have the authority to criticize me",
        scores: { beige: 0, purple: 1, red: 2, blue: 5, orange: 1, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I evaluate their feedback objectively for validity",
        scores: { beige: 0, purple: 0, red: 1, blue: 2, orange: 5, green: 2, yellow: 1, turquoise: 0, coral: 0 }
      },
      {
        text: "I try to understand their feelings and perspective",
        scores: { beige: 0, purple: 0, red: 0, blue: 1, orange: 2, green: 5, yellow: 2, turquoise: 1, coral: 0 }
      },
      {
        text: "I see it as information about our different worldviews",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 1, green: 2, yellow: 5, turquoise: 2, coral: 1 }
      },
      {
        text: "I accept it with equanimity as part of the human experience",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 1, yellow: 2, turquoise: 5, coral: 2 }
      },
      {
        text: "I see all criticism as consciousness exploring itself",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 0, yellow: 1, turquoise: 2, coral: 5 }
      }
    ]
  },
  {
    id: 11,
    question: "When you think about the future of humanity, what's your main concern?",
    category: "systems-thinking",
    options: [
      {
        text: "Basic survival of our species",
        scores: { beige: 5, purple: 2, red: 1, blue: 0, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "Preserving our cultural heritage and traditions",
        scores: { beige: 1, purple: 5, red: 1, blue: 1, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "That I can protect myself and those I care about",
        scores: { beige: 1, purple: 2, red: 5, blue: 2, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "That order and traditional values are maintained",
        scores: { beige: 0, purple: 1, red: 1, blue: 5, orange: 1, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "That we continue to advance technologically and economically",
        scores: { beige: 0, purple: 0, red: 1, blue: 2, orange: 5, green: 1, yellow: 1, turquoise: 0, coral: 0 }
      },
      {
        text: "That we create a more just and equitable world",
        scores: { beige: 0, purple: 0, red: 0, blue: 1, orange: 2, green: 5, yellow: 2, turquoise: 1, coral: 0 }
      },
      {
        text: "That we develop the wisdom to navigate complexity",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 1, green: 2, yellow: 5, turquoise: 2, coral: 1 }
      },
      {
        text: "That we awaken to our cosmic purpose",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 1, yellow: 2, turquoise: 5, coral: 2 }
      },
      {
        text: "That consciousness fully awakens to itself through humanity",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 0, yellow: 1, turquoise: 2, coral: 5 }
      }
    ]
  },
  {
    id: 12,
    question: "How do you prefer to solve conflicts between groups?",
    category: "perspective-taking",
    options: [
      {
        text: "Focus on basic survival needs of all parties",
        scores: { beige: 5, purple: 1, red: 1, blue: 0, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "Use traditional rituals and tribal wisdom",
        scores: { beige: 1, purple: 5, red: 1, blue: 1, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "The strongest or most determined group should win",
        scores: { beige: 1, purple: 2, red: 5, blue: 2, orange: 1, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "Apply established laws and procedures fairly",
        scores: { beige: 0, purple: 1, red: 1, blue: 5, orange: 2, green: 1, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "Find a rational solution that maximizes benefits",
        scores: { beige: 0, purple: 0, red: 1, blue: 2, orange: 5, green: 2, yellow: 1, turquoise: 0, coral: 0 }
      },
      {
        text: "Ensure all voices are heard and find consensus",
        scores: { beige: 0, purple: 0, red: 0, blue: 1, orange: 2, green: 5, yellow: 2, turquoise: 1, coral: 0 }
      },
      {
        text: "Understand the developmental needs of each group",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 1, green: 2, yellow: 5, turquoise: 2, coral: 1 }
      },
      {
        text: "Help them transcend the conflict through deeper awareness",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 1, yellow: 2, turquoise: 5, coral: 2 }
      },
      {
        text: "See all conflict as consciousness exploring different expressions",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 0, yellow: 1, turquoise: 2, coral: 5 }
      }
    ]
  },
  {
    id: 13,
    question: "What role does spirituality or meaning play in your life?",
    category: "meta-cognitive",
    options: [
      {
        text: "I focus on concrete, immediate physical concerns",
        scores: { beige: 5, purple: 1, red: 1, blue: 0, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I follow ancestral spirits and tribal spiritual practices",
        scores: { beige: 1, purple: 5, red: 1, blue: 1, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I use spiritual power to get what I want",
        scores: { beige: 1, purple: 2, red: 5, blue: 1, orange: 1, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I follow traditional religious or cultural practices",
        scores: { beige: 0, purple: 1, red: 1, blue: 5, orange: 1, green: 1, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I'm interested in what can be proven rationally",
        scores: { beige: 0, purple: 0, red: 1, blue: 2, orange: 5, green: 1, yellow: 1, turquoise: 0, coral: 0 }
      },
      {
        text: "I explore diverse spiritual traditions for insights",
        scores: { beige: 0, purple: 0, red: 0, blue: 1, orange: 2, green: 5, yellow: 2, turquoise: 1, coral: 0 }
      },
      {
        text: "I see spirituality as one line of human development",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 1, green: 2, yellow: 5, turquoise: 2, coral: 1 }
      },
      {
        text: "I experience direct unity with cosmic consciousness",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 1, yellow: 2, turquoise: 5, coral: 2 }
      },
      {
        text: "I am spirituality - pure awareness expressing itself",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 0, yellow: 1, turquoise: 2, coral: 5 }
      }
    ]
  },
  {
    id: 14,
    question: "How do you handle rapid change in your environment?",
    category: "complexity",
    options: [
      {
        text: "I focus on immediate survival responses",
        scores: { beige: 5, purple: 1, red: 1, blue: 0, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I rely on tribal wisdom and collective responses",
        scores: { beige: 1, purple: 5, red: 1, blue: 1, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I adapt quickly and seize new opportunities",
        scores: { beige: 1, purple: 1, red: 5, blue: 1, orange: 2, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I rely on established structures to provide stability",
        scores: { beige: 0, purple: 1, red: 1, blue: 5, orange: 1, green: 1, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I analyze trends and plan strategically",
        scores: { beige: 0, purple: 0, red: 1, blue: 2, orange: 5, green: 1, yellow: 1, turquoise: 0, coral: 0 }
      },
      {
        text: "I work with others to adapt together",
        scores: { beige: 0, purple: 0, red: 0, blue: 1, orange: 2, green: 5, yellow: 2, turquoise: 1, coral: 0 }
      },
      {
        text: "I see change as natural evolution of complex systems",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 1, green: 2, yellow: 5, turquoise: 2, coral: 1 }
      },
      {
        text: "I flow with change as part of cosmic unfolding",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 1, yellow: 2, turquoise: 5, coral: 2 }
      },
      {
        text: "I am change itself - pure awareness in motion",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 0, yellow: 1, turquoise: 2, coral: 5 }
      }
    ]
  },
  {
    id: 15,
    question: "What's your approach to making ethical decisions?",
    category: "meta-cognitive",
    options: [
      {
        text: "I do what helps me survive and meet basic needs",
        scores: { beige: 5, purple: 1, red: 1, blue: 0, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I follow tribal customs and ancestral guidance",
        scores: { beige: 1, purple: 5, red: 1, blue: 1, orange: 0, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I do what benefits me and those close to me",
        scores: { beige: 1, purple: 2, red: 5, blue: 2, orange: 1, green: 0, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I follow moral codes and established principles",
        scores: { beige: 0, purple: 1, red: 1, blue: 5, orange: 1, green: 1, yellow: 0, turquoise: 0, coral: 0 }
      },
      {
        text: "I weigh costs and benefits rationally",
        scores: { beige: 0, purple: 0, red: 1, blue: 2, orange: 5, green: 2, yellow: 1, turquoise: 0, coral: 0 }
      },
      {
        text: "I consider the impact on all stakeholders",
        scores: { beige: 0, purple: 0, red: 0, blue: 1, orange: 2, green: 5, yellow: 2, turquoise: 1, coral: 0 }
      },
      {
        text: "I integrate multiple ethical frameworks contextually",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 1, green: 2, yellow: 5, turquoise: 2, coral: 1 }
      },
      {
        text: "I act from universal compassion and wisdom",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 1, yellow: 2, turquoise: 5, coral: 2 }
      },
      {
        text: "I am ethics itself - pure love in action",
        scores: { beige: 0, purple: 0, red: 0, blue: 0, orange: 0, green: 0, yellow: 1, turquoise: 2, coral: 5 }
      }
    ]
  }
];

export function calculateIntegralScores(responses: Record<number, number>): Record<string, number> {
  const scores: Record<string, number> = {
    beige: 0,
    purple: 0,
    red: 0,
    blue: 0,
    orange: 0,
    green: 0,
    yellow: 0,
    turquoise: 0,
    coral: 0
  };

  Object.entries(responses).forEach(([questionId, answerIndex]) => {
    const question = INTEGRAL_QUESTIONS.find(q => q.id === parseInt(questionId));
    if (question && question.options[answerIndex]) {
      const answerScores = question.options[answerIndex].scores;
      Object.entries(answerScores).forEach(([level, score]) => {
        scores[level] += score;
      });
    }
  });

  return scores;
}