export interface FrameworkDescription {
  name: string;
  description: string;
  strengths: string[];
  challenges: string[];
  workStyle: string;
  relationships: string;
  growthTips: string[];
}

export class FrameworkDescriptions {
  static getMBTIDescription(type: string): FrameworkDescription {
    const descriptions: Record<string, FrameworkDescription> = {
      'INTJ': {
        name: 'The Architect',
        description: 'Strategic planners with a natural drive for implementing their ideas. You are independent thinkers who see possibilities for improvement everywhere.',
        strengths: [
          'Excellent long-term strategic thinking',
          'Independent and self-motivated',
          'High standards and attention to quality',
          'Natural systems thinking'
        ],
        challenges: [
          'May appear aloof or intimidating',
          'Can be overly critical of inefficient systems',
          'Sometimes struggle with emotional expression',
          'May dismiss ideas that seem impractical'
        ],
        workStyle: 'You thrive in environments that allow for independent work and strategic planning. You prefer having autonomy and the ability to implement your vision without micromanagement.',
        relationships: 'You value intellectual connection and depth in relationships. You may have a small circle of close friends rather than many acquaintances.',
        growthTips: [
          'Practice expressing appreciation for others more openly',
          'Work on patience when explaining your ideas',
          'Consider others\' emotional needs in decision-making'
        ]
      },
      'ENFP': {
        name: 'The Campaigner',
        description: 'Enthusiastic and creative individuals who see life as full of possibilities. You inspire others with your energy and optimism.',
        strengths: [
          'Excellent people skills and empathy',
          'Creative problem-solving abilities',
          'Adaptable and flexible',
          'Natural ability to motivate others'
        ],
        challenges: [
          'May struggle with routine tasks',
          'Can become overwhelmed by too many options',
          'Sometimes difficulty with follow-through',
          'May take criticism too personally'
        ],
        workStyle: 'You excel in collaborative environments with variety and creative freedom. You prefer flexible schedules and the opportunity to work with different people.',
        relationships: 'You form connections easily and maintain a wide network of friends. You value authenticity and emotional openness in relationships.',
        growthTips: [
          'Develop better organizational systems',
          'Practice focusing on completing projects',
          'Learn to handle constructive criticism objectively'
        ]
      },
      'ISTJ': {
        name: 'The Logistician',
        description: 'Practical and fact-minded individuals who are reliable and responsible. You are the backbone of many organizations.',
        strengths: [
          'Exceptional reliability and responsibility',
          'Strong organizational skills',
          'Attention to detail and accuracy',
          'Calm under pressure'
        ],
        challenges: [
          'May resist change or new approaches',
          'Can be overly critical of inefficiency',
          'Sometimes struggle with abstract concepts',
          'May appear inflexible to others'
        ],
        workStyle: 'You thrive in structured environments with clear expectations and established procedures. You prefer stability and the opportunity to perfect your work.',
        relationships: 'You are loyal and dependable in relationships, though you may need time to open up. You value tradition and stability.',
        growthTips: [
          'Practice being more open to new ideas',
          'Work on expressing emotions more openly',
          'Consider the big picture alongside details'
        ]
      }
      // Add more MBTI types as needed
    };

    return descriptions[type] || {
      name: 'Unique Type',
      description: 'Your personality type represents a unique combination of traits that make you who you are.',
      strengths: ['Individual strengths based on your specific traits'],
      challenges: ['Areas for potential growth and development'],
      workStyle: 'Your work style reflects your personal preferences and natural tendencies.',
      relationships: 'Your relationship style is shaped by your unique personality pattern.',
      growthTips: ['Focus on developing your natural strengths while addressing growth areas']
    };
  }

  static getEnneagramDescription(type: string): FrameworkDescription {
    const descriptions: Record<string, FrameworkDescription> = {
      'Type 1': {
        name: 'The Perfectionist',
        description: 'You are motivated by the need to be good and right, and to improve everything. You have a strong inner critic and high standards.',
        strengths: [
          'High ethical standards and integrity',
          'Excellent attention to detail',
          'Strong sense of responsibility',
          'Natural ability to see how things can be improved'
        ],
        challenges: [
          'Can be overly critical of self and others',
          'May struggle with perfectionism',
          'Sometimes inflexible about "the right way"',
          'May suppress anger inappropriately'
        ],
        workStyle: 'You excel in roles that require precision, quality control, and systematic improvement. You prefer clear standards and structured environments.',
        relationships: 'You are loyal and responsible in relationships but may struggle with criticism and the imperfections of others.',
        growthTips: [
          'Practice self-compassion and acceptance',
          'Learn to express anger in healthy ways',
          'Focus on progress rather than perfection'
        ]
      },
      'Type 2': {
        name: 'The Helper',
        description: 'You are motivated by the need to be loved and needed. You focus on others\' needs and pride yourself on being helpful.',
        strengths: [
          'Exceptional empathy and interpersonal skills',
          'Natural ability to support and encourage others',
          'Generous and giving nature',
          'Strong emotional intelligence'
        ],
        challenges: [
          'May neglect own needs for others',
          'Can become resentful when help isn\'t appreciated',
          'Sometimes manipulative to get needs met',
          'May struggle with boundaries'
        ],
        workStyle: 'You thrive in people-oriented roles where you can help, support, and develop others. You prefer collaborative environments.',
        relationships: 'You are warm and caring in relationships but may struggle with asking for what you need directly.',
        growthTips: [
          'Practice identifying and expressing your own needs',
          'Set healthy boundaries in relationships',
          'Learn to accept help from others'
        ]
      },
      'Type 3': {
        name: 'The Achiever',
        description: 'You are motivated by the need to be valued and worthwhile. You focus on goals, success, and image.',
        strengths: [
          'Exceptional drive and motivation',
          'Natural leadership abilities',
          'Adaptable and efficient',
          'Inspiring and charismatic'
        ],
        challenges: [
          'May sacrifice authenticity for image',
          'Can become overly competitive',
          'Sometimes workaholics',
          'May struggle with emotions and vulnerability'
        ],
        workStyle: 'You excel in goal-oriented, competitive environments where success is recognized. You prefer results-focused cultures.',
        relationships: 'You are charming and accomplished but may struggle with vulnerability and authentic emotional connection.',
        growthTips: [
          'Practice slowing down and being present',
          'Focus on authentic self-expression',
          'Learn to value yourself beyond achievements'
        ]
      }
      // Add more Enneagram types as needed
    };

    return descriptions[type] || {
      name: 'Unique Type',
      description: 'Your Enneagram type represents your core motivation and the lens through which you see the world.',
      strengths: ['Strengths based on your core motivations'],
      challenges: ['Growth areas related to your type pattern'],
      workStyle: 'Your work style reflects your core drives and motivations.',
      relationships: 'Your relationship patterns are influenced by your core type dynamics.',
      growthTips: ['Focus on developing the healthy aspects of your type']
    };
  }

  static getBigFiveDescription(traits: Record<string, number>) {
    const descriptions: Record<string, { high: string; low: string }> = {
      'Openness': {
        high: 'You are curious, creative, and open to new experiences. You enjoy exploring ideas and appreciate art and beauty.',
        low: 'You prefer familiar experiences and practical approaches. You value tradition and concrete, tangible results.'
      },
      'Conscientiousness': {
        high: 'You are organized, responsible, and disciplined. You plan ahead and follow through on commitments reliably.',
        low: 'You are flexible and spontaneous. You prefer to keep options open and adapt to situations as they arise.'
      },
      'Extraversion': {
        high: 'You are outgoing, energetic, and enjoy social interaction. You tend to be optimistic and assertive.',
        low: 'You are more reserved and prefer smaller groups or one-on-one interactions. You think before speaking and need alone time to recharge.'
      },
      'Agreeableness': {
        high: 'You are compassionate, trusting, and cooperative. You prefer harmony and are willing to compromise for others.',
        low: 'You are more skeptical and competitive. You speak your mind directly and prioritize objectivity over harmony.'
      },
      'Neuroticism': {
        high: 'You experience emotions intensely and may be more sensitive to stress. You are emotionally responsive and aware.',
        low: 'You are emotionally stable and resilient. You remain calm under pressure and bounce back quickly from setbacks.'
      }
    };

    return Object.entries(traits).map(([trait, score]) => ({
      trait,
      score,
      description: score > 6 ? descriptions[trait].high : descriptions[trait].low,
      level: score > 7 ? 'High' : score > 4 ? 'Moderate' : 'Low'
    }));
  }

  static getDnDAlignmentDescription(alignment: string): FrameworkDescription {
    const descriptions: Record<string, FrameworkDescription> = {
      'Lawful Good': {
        name: 'The Crusader',
        description: 'You believe in doing the right thing within a structured system. You combine a good heart with a strong moral code.',
        strengths: [
          'Strong moral compass and integrity',
          'Reliable and trustworthy',
          'Natural leadership in ethical matters',
          'Systematic approach to helping others'
        ],
        challenges: [
          'May be inflexible about rules',
          'Can be judgmental of those who break rules',
          'Sometimes struggle with moral gray areas',
          'May prioritize law over individual needs'
        ],
        workStyle: 'You thrive in environments with clear ethical guidelines and the opportunity to make a positive impact through structured approaches.',
        relationships: 'You are loyal and principled in relationships, though you may struggle when others don\'t share your values.',
        growthTips: [
          'Practice flexibility in how good can be achieved',
          'Consider individual circumstances in moral decisions',
          'Learn to work within imperfect systems'
        ]
      },
      'Chaotic Good': {
        name: 'The Rebel',
        description: 'You follow your conscience and do what you believe is right, regardless of what others expect. You value individual freedom and goodness.',
        strengths: [
          'Strong personal integrity',
          'Flexible and adaptive problem-solving',
          'Passionate about justice and fairness',
          'Independent thinking'
        ],
        challenges: [
          'May clash with authority figures',
          'Can be unpredictable or inconsistent',
          'Sometimes struggle with teamwork',
          'May ignore practical considerations'
        ],
        workStyle: 'You excel in environments that value innovation and individual contribution while working toward positive outcomes.',
        relationships: 'You are authentic and passionate but may struggle with partners who prefer predictability or conventional approaches.',
        growthTips: [
          'Learn to work effectively within systems',
          'Practice patience with different approaches',
          'Consider the value of consistency and reliability'
        ]
      }
      // Add more alignments as needed
    };

    return descriptions[alignment] || {
      name: 'Unique Alignment',
      description: 'Your moral alignment reflects your personal approach to ethics and decision-making.',
      strengths: ['Strengths based on your ethical approach'],
      challenges: ['Areas where your approach might create challenges'],
      workStyle: 'Your work style reflects your values and ethical framework.',
      relationships: 'Your relationships are guided by your personal moral compass.',
      growthTips: ['Focus on understanding different ethical perspectives']
    };
  }
}