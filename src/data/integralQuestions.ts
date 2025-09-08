// Cognitive Development Questions for Integral Theory Assessment
// Based on Ken Wilber's Integral Theory and Spiral Dynamics

export interface IntegralQuestion {
  id: number;
  question: string;
  options: {
    text: string;
    scores: {
      red: number;
      amber: number;
      orange: number;
      green: number;
      teal: number;
      turquoise: number;
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
        text: "I act quickly and decisively to get what I need",
        scores: { red: 5, amber: 1, orange: 2, green: 1, teal: 0, turquoise: 0 }
      },
      {
        text: "I follow established procedures and rules",
        scores: { red: 1, amber: 5, orange: 2, green: 1, teal: 0, turquoise: 0 }
      },
      {
        text: "I analyze the data and create a strategic plan",
        scores: { red: 1, amber: 2, orange: 5, green: 1, teal: 1, turquoise: 0 }
      },
      {
        text: "I consider how it affects everyone involved and seek consensus",
        scores: { red: 0, amber: 1, orange: 2, green: 5, teal: 2, turquoise: 1 }
      },
      {
        text: "I look at multiple perspectives and integrate different approaches",
        scores: { red: 0, amber: 0, orange: 1, green: 2, teal: 5, turquoise: 2 }
      },
      {
        text: "I connect with deeper patterns and universal principles at play",
        scores: { red: 0, amber: 0, orange: 0, green: 1, teal: 2, turquoise: 5 }
      }
    ]
  },
  {
    id: 2,
    question: "When people disagree with you, what is your typical response?",
    category: "perspective-taking",
    options: [
      {
        text: "I assert my position strongly to make sure I'm heard",
        scores: { red: 5, amber: 2, orange: 1, green: 0, teal: 0, turquoise: 0 }
      },
      {
        text: "I refer to established rules or authorities to resolve it",
        scores: { red: 1, amber: 5, orange: 1, green: 1, teal: 0, turquoise: 0 }
      },
      {
        text: "I present logical arguments and evidence to prove my point",
        scores: { red: 1, amber: 2, orange: 5, green: 1, teal: 1, turquoise: 0 }
      },
      {
        text: "I try to understand their perspective and find common ground",
        scores: { red: 0, amber: 1, orange: 2, green: 5, teal: 2, turquoise: 1 }
      },
      {
        text: "I explore how both viewpoints might be valid in different contexts",
        scores: { red: 0, amber: 0, orange: 1, green: 2, teal: 5, turquoise: 2 }
      },
      {
        text: "I see it as an opportunity to transcend the apparent conflict",
        scores: { red: 0, amber: 0, orange: 0, green: 1, teal: 2, turquoise: 5 }
      }
    ]
  },
  {
    id: 3,
    question: "How do you think about rules and authority in society?",
    category: "authority",
    options: [
      {
        text: "Rules are obstacles to getting what I want",
        scores: { red: 5, amber: 0, orange: 1, green: 0, teal: 0, turquoise: 0 }
      },
      {
        text: "Rules provide necessary order and should be followed",
        scores: { red: 1, amber: 5, orange: 1, green: 1, teal: 0, turquoise: 0 }
      },
      {
        text: "Rules are tools that should be efficient and rational",
        scores: { red: 1, amber: 2, orange: 5, green: 1, teal: 1, turquoise: 0 }
      },
      {
        text: "Rules should be fair and inclusive of all perspectives",
        scores: { red: 0, amber: 1, orange: 2, green: 5, teal: 2, turquoise: 1 }
      },
      {
        text: "Rules emerge naturally from understanding complex systems",
        scores: { red: 0, amber: 0, orange: 1, green: 2, teal: 5, turquoise: 2 }
      },
      {
        text: "Rules reflect deeper universal principles that transcend culture",
        scores: { red: 0, amber: 0, orange: 0, green: 1, teal: 2, turquoise: 5 }
      }
    ]
  },
  {
    id: 4,
    question: "When encountering contradictory information, how do you respond?",
    category: "paradox-tolerance",
    options: [
      {
        text: "I go with what feels right or serves my immediate needs",
        scores: { red: 5, amber: 1, orange: 0, green: 0, teal: 0, turquoise: 0 }
      },
      {
        text: "I look for the correct answer according to established sources",
        scores: { red: 1, amber: 5, orange: 2, green: 0, teal: 0, turquoise: 0 }
      },
      {
        text: "I analyze the evidence to determine which is more logical",
        scores: { red: 0, amber: 2, orange: 5, green: 1, teal: 1, turquoise: 0 }
      },
      {
        text: "I explore how different perspectives might all have validity",
        scores: { red: 0, amber: 0, orange: 2, green: 5, teal: 2, turquoise: 1 }
      },
      {
        text: "I look for how the contradictions might be part of a larger pattern",
        scores: { red: 0, amber: 0, orange: 1, green: 2, teal: 5, turquoise: 2 }
      },
      {
        text: "I see contradiction as pointing to a deeper unity beyond concepts",
        scores: { red: 0, amber: 0, orange: 0, green: 1, teal: 2, turquoise: 5 }
      }
    ]
  },
  {
    id: 5,
    question: "What motivates you most in making important life decisions?",
    category: "meta-cognitive",
    options: [
      {
        text: "Getting what I want when I want it",
        scores: { red: 5, amber: 1, orange: 0, green: 0, teal: 0, turquoise: 0 }
      },
      {
        text: "Doing what's right according to my values and traditions",
        scores: { red: 1, amber: 5, orange: 1, green: 1, teal: 0, turquoise: 0 }
      },
      {
        text: "Achieving success and accomplishing my goals",
        scores: { red: 1, amber: 2, orange: 5, green: 1, teal: 1, turquoise: 0 }
      },
      {
        text: "Creating harmony and helping others feel included",
        scores: { red: 0, amber: 1, orange: 2, green: 5, teal: 2, turquoise: 1 }
      },
      {
        text: "Understanding how everything connects and integrating wisdom",
        scores: { red: 0, amber: 0, orange: 1, green: 2, teal: 5, turquoise: 2 }
      },
      {
        text: "Aligning with cosmic purpose and universal consciousness",
        scores: { red: 0, amber: 0, orange: 0, green: 1, teal: 2, turquoise: 5 }
      }
    ]
  },
  {
    id: 6,
    question: "How do you prefer to learn new concepts?",
    category: "complexity",
    options: [
      {
        text: "Through direct experience and trial and error",
        scores: { red: 5, amber: 2, orange: 1, green: 0, teal: 0, turquoise: 0 }
      },
      {
        text: "By following established curricula and proven methods",
        scores: { red: 1, amber: 5, orange: 2, green: 1, teal: 0, turquoise: 0 }
      },
      {
        text: "Through systematic study and logical analysis",
        scores: { red: 0, amber: 2, orange: 5, green: 1, teal: 1, turquoise: 0 }
      },
      {
        text: "In groups where we can share different perspectives",
        scores: { red: 0, amber: 1, orange: 2, green: 5, teal: 2, turquoise: 1 }
      },
      {
        text: "By integrating multiple frameworks and seeing connections",
        scores: { red: 0, amber: 0, orange: 1, green: 2, teal: 5, turquoise: 2 }
      },
      {
        text: "Through contemplation and direct intuitive understanding",
        scores: { red: 0, amber: 0, orange: 0, green: 1, teal: 2, turquoise: 5 }
      }
    ]
  },
  {
    id: 7,
    question: "When considering global issues like climate change, what's your primary focus?",
    category: "systems-thinking",
    options: [
      {
        text: "How it affects me and my immediate circle",
        scores: { red: 5, amber: 2, orange: 0, green: 0, teal: 0, turquoise: 0 }
      },
      {
        text: "What authorities and institutions say we should do",
        scores: { red: 1, amber: 5, orange: 1, green: 1, teal: 0, turquoise: 0 }
      },
      {
        text: "Finding practical, efficient solutions",
        scores: { red: 0, amber: 2, orange: 5, green: 2, teal: 1, turquoise: 0 }
      },
      {
        text: "Ensuring everyone has a voice and feels heard",
        scores: { red: 0, amber: 1, orange: 2, green: 5, teal: 2, turquoise: 1 }
      },
      {
        text: "Understanding the complex interconnections across all systems",
        scores: { red: 0, amber: 0, orange: 1, green: 2, teal: 5, turquoise: 2 }
      },
      {
        text: "Seeing it as part of a larger evolutionary transformation",
        scores: { red: 0, amber: 0, orange: 0, green: 1, teal: 2, turquoise: 5 }
      }
    ]
  },
  {
    id: 8,
    question: "How do you handle situations where you need to make decisions with incomplete information?",
    category: "complexity",
    options: [
      {
        text: "I trust my gut and act quickly",
        scores: { red: 5, amber: 1, orange: 1, green: 0, teal: 0, turquoise: 0 }
      },
      {
        text: "I seek guidance from established authorities or precedents",
        scores: { red: 1, amber: 5, orange: 1, green: 1, teal: 0, turquoise: 0 }
      },
      {
        text: "I gather as much data as possible and do risk analysis",
        scores: { red: 1, amber: 2, orange: 5, green: 1, teal: 1, turquoise: 0 }
      },
      {
        text: "I consult with others to get diverse perspectives",
        scores: { red: 0, amber: 1, orange: 2, green: 5, teal: 2, turquoise: 1 }
      },
      {
        text: "I accept uncertainty as natural and work with multiple possibilities",
        scores: { red: 0, amber: 0, orange: 1, green: 2, teal: 5, turquoise: 2 }
      },
      {
        text: "I trust in the larger intelligence of the universe",
        scores: { red: 0, amber: 0, orange: 0, green: 1, teal: 2, turquoise: 5 }
      }
    ]
  },
  {
    id: 9,
    question: "What does 'being successful' mean to you?",
    category: "meta-cognitive",
    options: [
      {
        text: "Having power and getting what I want",
        scores: { red: 5, amber: 1, orange: 1, green: 0, teal: 0, turquoise: 0 }
      },
      {
        text: "Living according to proper values and earning respect",
        scores: { red: 1, amber: 5, orange: 1, green: 1, teal: 0, turquoise: 0 }
      },
      {
        text: "Achieving my goals and advancing in my career",
        scores: { red: 1, amber: 2, orange: 5, green: 1, teal: 1, turquoise: 0 }
      },
      {
        text: "Contributing to community wellbeing and social justice",
        scores: { red: 0, amber: 1, orange: 2, green: 5, teal: 2, turquoise: 1 }
      },
      {
        text: "Understanding my place in the larger web of existence",
        scores: { red: 0, amber: 0, orange: 1, green: 2, teal: 5, turquoise: 2 }
      },
      {
        text: "Realizing my unity with all of consciousness",
        scores: { red: 0, amber: 0, orange: 0, green: 1, teal: 2, turquoise: 5 }
      }
    ]
  },
  {
    id: 10,
    question: "How do you typically respond to criticism?",
    category: "perspective-taking",
    options: [
      {
        text: "I defend myself or attack back",
        scores: { red: 5, amber: 2, orange: 1, green: 0, teal: 0, turquoise: 0 }
      },
      {
        text: "I check if they have the authority to criticize me",
        scores: { red: 2, amber: 5, orange: 1, green: 0, teal: 0, turquoise: 0 }
      },
      {
        text: "I evaluate their feedback objectively for validity",
        scores: { red: 1, amber: 2, orange: 5, green: 2, teal: 1, turquoise: 0 }
      },
      {
        text: "I try to understand their feelings and perspective",
        scores: { red: 0, amber: 1, orange: 2, green: 5, teal: 2, turquoise: 1 }
      },
      {
        text: "I see it as information about our different worldviews",
        scores: { red: 0, amber: 0, orange: 1, green: 2, teal: 5, turquoise: 2 }
      },
      {
        text: "I accept it with equanimity as part of the human experience",
        scores: { red: 0, amber: 0, orange: 0, green: 1, teal: 2, turquoise: 5 }
      }
    ]
  },
  {
    id: 11,
    question: "When you think about the future of humanity, what's your main concern?",
    category: "systems-thinking",
    options: [
      {
        text: "That I can protect myself and those I care about",
        scores: { red: 5, amber: 2, orange: 0, green: 0, teal: 0, turquoise: 0 }
      },
      {
        text: "That order and traditional values are maintained",
        scores: { red: 1, amber: 5, orange: 1, green: 0, teal: 0, turquoise: 0 }
      },
      {
        text: "That we continue to advance technologically and economically",
        scores: { red: 1, amber: 2, orange: 5, green: 1, teal: 1, turquoise: 0 }
      },
      {
        text: "That we create a more just and equitable world",
        scores: { red: 0, amber: 1, orange: 2, green: 5, teal: 2, turquoise: 1 }
      },
      {
        text: "That we develop the wisdom to navigate complexity",
        scores: { red: 0, amber: 0, orange: 1, green: 2, teal: 5, turquoise: 2 }
      },
      {
        text: "That we awaken to our cosmic purpose",
        scores: { red: 0, amber: 0, orange: 0, green: 1, teal: 2, turquoise: 5 }
      }
    ]
  },
  {
    id: 12,
    question: "How do you prefer to solve conflicts between groups?",
    category: "perspective-taking",
    options: [
      {
        text: "The strongest or most determined group should win",
        scores: { red: 5, amber: 2, orange: 1, green: 0, teal: 0, turquoise: 0 }
      },
      {
        text: "Apply established laws and procedures fairly",
        scores: { red: 1, amber: 5, orange: 2, green: 1, teal: 0, turquoise: 0 }
      },
      {
        text: "Find a rational solution that maximizes benefits",
        scores: { red: 1, amber: 2, orange: 5, green: 2, teal: 1, turquoise: 0 }
      },
      {
        text: "Ensure all voices are heard and find consensus",
        scores: { red: 0, amber: 1, orange: 2, green: 5, teal: 2, turquoise: 1 }
      },
      {
        text: "Understand the developmental needs of each group",
        scores: { red: 0, amber: 0, orange: 1, green: 2, teal: 5, turquoise: 2 }
      },
      {
        text: "Help them transcend the conflict through deeper awareness",
        scores: { red: 0, amber: 0, orange: 0, green: 1, teal: 2, turquoise: 5 }
      }
    ]
  },
  {
    id: 13,
    question: "What role does spirituality or meaning play in your life?",
    category: "meta-cognitive",
    options: [
      {
        text: "I focus on concrete, immediate concerns",
        scores: { red: 5, amber: 2, orange: 1, green: 0, teal: 0, turquoise: 0 }
      },
      {
        text: "I follow traditional religious or cultural practices",
        scores: { red: 1, amber: 5, orange: 1, green: 1, teal: 0, turquoise: 0 }
      },
      {
        text: "I'm interested in what can be proven rationally",
        scores: { red: 1, amber: 2, orange: 5, green: 1, teal: 1, turquoise: 0 }
      },
      {
        text: "I explore diverse spiritual traditions for insights",
        scores: { red: 0, amber: 1, orange: 2, green: 5, teal: 2, turquoise: 1 }
      },
      {
        text: "I see spirituality as one line of human development",
        scores: { red: 0, amber: 0, orange: 1, green: 2, teal: 5, turquoise: 2 }
      },
      {
        text: "I experience direct unity with cosmic consciousness",
        scores: { red: 0, amber: 0, orange: 0, green: 1, teal: 2, turquoise: 5 }
      }
    ]
  },
  {
    id: 14,
    question: "How do you handle rapid change in your environment?",
    category: "complexity",
    options: [
      {
        text: "I adapt quickly and seize new opportunities",
        scores: { red: 5, amber: 1, orange: 2, green: 0, teal: 0, turquoise: 0 }
      },
      {
        text: "I rely on established structures to provide stability",
        scores: { red: 1, amber: 5, orange: 1, green: 1, teal: 0, turquoise: 0 }
      },
      {
        text: "I analyze trends and plan strategically",
        scores: { red: 1, amber: 2, orange: 5, green: 1, teal: 1, turquoise: 0 }
      },
      {
        text: "I work with others to adapt together",
        scores: { red: 0, amber: 1, orange: 2, green: 5, teal: 2, turquoise: 1 }
      },
      {
        text: "I see change as natural evolution of complex systems",
        scores: { red: 0, amber: 0, orange: 1, green: 2, teal: 5, turquoise: 2 }
      },
      {
        text: "I flow with change as part of cosmic unfolding",
        scores: { red: 0, amber: 0, orange: 0, green: 1, teal: 2, turquoise: 5 }
      }
    ]
  },
  {
    id: 15,
    question: "What's your approach to making ethical decisions?",
    category: "meta-cognitive",
    options: [
      {
        text: "I do what benefits me and those close to me",
        scores: { red: 5, amber: 2, orange: 1, green: 0, teal: 0, turquoise: 0 }
      },
      {
        text: "I follow moral codes and established principles",
        scores: { red: 1, amber: 5, orange: 1, green: 1, teal: 0, turquoise: 0 }
      },
      {
        text: "I weigh costs and benefits rationally",
        scores: { red: 1, amber: 2, orange: 5, green: 2, teal: 1, turquoise: 0 }
      },
      {
        text: "I consider the impact on all stakeholders",
        scores: { red: 0, amber: 1, orange: 2, green: 5, teal: 2, turquoise: 1 }
      },
      {
        text: "I integrate multiple ethical frameworks contextually",
        scores: { red: 0, amber: 0, orange: 1, green: 2, teal: 5, turquoise: 2 }
      },
      {
        text: "I act from compassionate awareness of universal interconnection",
        scores: { red: 0, amber: 0, orange: 0, green: 1, teal: 2, turquoise: 5 }
      }
    ]
  }
];

export function calculateIntegralScores(responses: Record<number, number>): Record<string, number> {
  const scores = {
    red: 0,
    amber: 0,
    orange: 0,
    green: 0,
    teal: 0,
    turquoise: 0
  };

  Object.entries(responses).forEach(([questionId, answerIndex]) => {
    const question = INTEGRAL_QUESTIONS.find(q => q.id === parseInt(questionId));
    if (question && question.options[answerIndex]) {
      const answerScores = question.options[answerIndex].scores;
      Object.entries(answerScores).forEach(([level, points]) => {
        scores[level as keyof typeof scores] += points;
      });
    }
  });

  return scores;
}