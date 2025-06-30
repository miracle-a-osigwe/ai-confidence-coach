export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'confidence' | 'clarity' | 'body-language' | 'engagement';
  objectives: string[];
  exercises: Exercise[];
  isPremium: boolean;
  thumbnailUrl: string;
  order: number;
  personalizedFor?: string[]; // User goals this lesson is personalized for
  adaptiveContent?: {
    beginner: Partial<Exercise>[];
    intermediate: Partial<Exercise>[];
    advanced: Partial<Exercise>[];
  };
}

export interface Exercise {
  id: string;
  type: 'practice' | 'reflection' | 'interactive';
  title: string;
  instructions: string;
  duration: number; // in seconds
  prompts?: string[];
  expectedOutcomes?: string[];
  adaptiveInstructions?: {
    beginner?: string;
    intermediate?: string;
    advanced?: string;
  };
}

export interface LessonProgress {
  lessonId: string;
  userId: string;
  completed: boolean;
  progress: number; // 0-100
  startedAt: string;
  completedAt?: string;
  scores: {
    confidence: number;
    clarity: number;
    engagement: number;
    overall: number;
  };
  feedback: string[];
  personalizedFeedback?: string[];
}

class LessonsService {
  private lessons: Lesson[] = [];
  private userProgress: Map<string, LessonProgress> = new Map();

  constructor() {
    this.initializeLessons();
  }

  private initializeLessons() {
    this.lessons = [
      // FREE LESSONS (5 total - covering all categories)
      
      // CONFIDENCE CATEGORY - Free Lessons
      {
        id: 'confidence-1',
        title: 'Building Basic Confidence',
        description: 'Learn fundamental techniques to overcome speaking anxiety and build initial confidence.',
        duration: 15,
        difficulty: 'beginner',
        category: 'confidence',
        objectives: [
          'Understand the root causes of speaking anxiety',
          'Learn breathing techniques for confidence',
          'Practice positive self-talk strategies',
          'Develop a pre-speaking routine'
        ],
        exercises: [
          {
            id: 'conf-1-1',
            type: 'reflection',
            title: 'Identify Your Speaking Fears',
            instructions: 'Think about what specifically makes you nervous when speaking. Write down or speak about your main concerns.',
            duration: 180,
            prompts: [
              'What situations make you most nervous?',
              'What physical sensations do you notice?',
              'What thoughts go through your mind?'
            ],
            adaptiveInstructions: {
              beginner: 'Take your time to really think about these questions. There are no wrong answers.',
              intermediate: 'Be specific about your fears and try to identify patterns.',
              advanced: 'Analyze the root causes and think about how they might be addressed.'
            }
          },
          {
            id: 'conf-1-2',
            type: 'practice',
            title: 'Confidence Breathing Exercise',
            instructions: 'Practice the 4-7-8 breathing technique while speaking a simple introduction.',
            duration: 300,
            expectedOutcomes: ['Reduced physical tension', 'Calmer voice tone', 'Better focus']
          },
          {
            id: 'conf-1-3',
            type: 'interactive',
            title: 'Power Pose Practice',
            instructions: 'Stand in a confident posture and deliver a 30-second introduction about yourself.',
            duration: 240,
            prompts: [
              'Stand tall with shoulders back',
              'Make eye contact with the camera',
              'Speak clearly and slowly'
            ]
          }
        ],
        isPremium: false,
        thumbnailUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
        order: 1,
        personalizedFor: ['presentations', 'interviews', 'public-speaking']
      },

      // CLARITY CATEGORY - Free Lesson
      {
        id: 'clarity-1',
        title: 'Voice and Clarity Fundamentals',
        description: 'Master the basics of clear, confident vocal delivery and articulation.',
        duration: 20,
        difficulty: 'beginner',
        category: 'clarity',
        objectives: [
          'Develop proper breathing for speech',
          'Improve articulation and pronunciation',
          'Learn to control pace and volume',
          'Practice vocal warm-up exercises'
        ],
        exercises: [
          {
            id: 'clar-1-1',
            type: 'practice',
            title: 'Vocal Warm-Up Routine',
            instructions: 'Follow along with vocal exercises to prepare your voice for speaking.',
            duration: 300,
            prompts: [
              'Lip trills and tongue twisters',
              'Humming scales',
              'Articulation exercises'
            ]
          },
          {
            id: 'clar-1-2',
            type: 'practice',
            title: 'Pace and Pause Control',
            instructions: 'Read a passage while focusing on controlled pacing and strategic pauses.',
            duration: 360,
            expectedOutcomes: ['More controlled delivery', 'Better emphasis', 'Clearer message']
          },
          {
            id: 'clar-1-3',
            type: 'interactive',
            title: 'Volume and Projection',
            instructions: 'Practice speaking at different volumes while maintaining clarity.',
            duration: 240,
            prompts: [
              'Start with normal conversation volume',
              'Gradually increase to presentation volume',
              'Maintain clear articulation throughout'
            ]
          }
        ],
        isPremium: false,
        thumbnailUrl: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=400',
        order: 2,
        personalizedFor: ['presentations', 'interviews', 'academic']
      },

      // BODY LANGUAGE CATEGORY - Free Lesson
      {
        id: 'body-language-1',
        title: 'Essential Body Language Basics',
        description: 'Learn fundamental non-verbal communication skills for confident speaking.',
        duration: 18,
        difficulty: 'beginner',
        category: 'body-language',
        objectives: [
          'Master basic posture and stance',
          'Learn essential hand gestures',
          'Practice eye contact techniques',
          'Understand personal space and movement'
        ],
        exercises: [
          {
            id: 'body-1-1',
            type: 'practice',
            title: 'Posture Foundation',
            instructions: 'Practice maintaining confident posture while speaking.',
            duration: 300,
            prompts: [
              'Stand with feet shoulder-width apart',
              'Keep shoulders relaxed but straight',
              'Engage your core for stability'
            ]
          },
          {
            id: 'body-1-2',
            type: 'interactive',
            title: 'Basic Gesture Practice',
            instructions: 'Learn and practice fundamental hand gestures that support your message.',
            duration: 420,
            expectedOutcomes: ['Natural hand movements', 'Better message support', 'Reduced fidgeting']
          },
          {
            id: 'body-1-3',
            type: 'practice',
            title: 'Eye Contact Fundamentals',
            instructions: 'Practice maintaining appropriate eye contact patterns.',
            duration: 240,
            prompts: [
              'Look directly at the camera',
              'Practice the 3-5 second rule',
              'Avoid looking down or away'
            ]
          }
        ],
        isPremium: false,
        thumbnailUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
        order: 3,
        personalizedFor: ['presentations', 'interviews', 'public-speaking']
      },

      // ENGAGEMENT CATEGORY - Free Lesson
      {
        id: 'engagement-1',
        title: 'Audience Connection Basics',
        description: 'Learn fundamental techniques to connect with and engage your audience.',
        duration: 22,
        difficulty: 'beginner',
        category: 'engagement',
        objectives: [
          'Understand audience psychology',
          'Learn basic storytelling techniques',
          'Practice vocal variety for engagement',
          'Master opening and closing techniques'
        ],
        exercises: [
          {
            id: 'eng-1-1',
            type: 'reflection',
            title: 'Know Your Audience',
            instructions: 'Think about your typical audience and what engages them.',
            duration: 240,
            prompts: [
              'Who are you usually speaking to?',
              'What are their interests and concerns?',
              'How can you relate to them?'
            ]
          },
          {
            id: 'eng-1-2',
            type: 'practice',
            title: 'Simple Storytelling',
            instructions: 'Practice telling a short, engaging story with clear structure.',
            duration: 480,
            expectedOutcomes: ['Clear narrative structure', 'Emotional connection', 'Memorable message']
          },
          {
            id: 'eng-1-3',
            type: 'interactive',
            title: 'Vocal Variety Practice',
            instructions: 'Practice using different tones, pace, and volume to maintain interest.',
            duration: 360,
            prompts: [
              'Vary your pace for emphasis',
              'Use tone to convey emotion',
              'Practice strategic pauses'
            ]
          }
        ],
        isPremium: false,
        thumbnailUrl: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400',
        order: 4,
        personalizedFor: ['presentations', 'public-speaking', 'academic']
      },

      // MIXED CATEGORY - Free Lesson
      {
        id: 'mixed-1',
        title: 'Complete Confidence Foundation',
        description: 'A comprehensive lesson combining all essential speaking skills for beginners.',
        duration: 25,
        difficulty: 'beginner',
        category: 'confidence',
        objectives: [
          'Integrate all fundamental skills',
          'Practice complete presentations',
          'Build overall speaking confidence',
          'Develop personal speaking style'
        ],
        exercises: [
          {
            id: 'mix-1-1',
            type: 'practice',
            title: 'Integrated Skills Practice',
            instructions: 'Combine posture, voice, and engagement in a short presentation.',
            duration: 600,
            prompts: [
              'Focus on all elements together',
              'Don\'t worry about perfection',
              'Build confidence through practice'
            ]
          },
          {
            id: 'mix-1-2',
            type: 'interactive',
            title: 'Personal Style Development',
            instructions: 'Discover and practice your natural speaking style.',
            duration: 480,
            expectedOutcomes: ['Authentic delivery', 'Personal confidence', 'Natural presence']
          },
          {
            id: 'mix-1-3',
            type: 'reflection',
            title: 'Progress Assessment',
            instructions: 'Reflect on your improvement and set goals for continued growth.',
            duration: 300,
            prompts: [
              'What has improved since you started?',
              'What areas need more work?',
              'What are your next goals?'
            ]
          }
        ],
        isPremium: false,
        thumbnailUrl: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400',
        order: 5,
        personalizedFor: ['presentations', 'interviews', 'public-speaking', 'academic']
      },

      // PREMIUM LESSONS START HERE

      // CONFIDENCE CATEGORY - Premium Lessons
      {
        id: 'confidence-2',
        title: 'Advanced Confidence Building',
        description: 'Master advanced techniques for unshakeable confidence in any speaking situation.',
        duration: 30,
        difficulty: 'intermediate',
        category: 'confidence',
        objectives: [
          'Develop mental resilience techniques',
          'Master confidence anchoring',
          'Learn to handle unexpected situations',
          'Build authentic self-assurance'
        ],
        exercises: [
          {
            id: 'conf-2-1',
            type: 'practice',
            title: 'Confidence Anchoring',
            instructions: 'Learn to create and use confidence anchors for instant confidence boosts.',
            duration: 420,
            prompts: [
              'Identify your peak confidence moments',
              'Create physical and mental anchors',
              'Practice activating your anchors'
            ]
          },
          {
            id: 'conf-2-2',
            type: 'interactive',
            title: 'Pressure Situation Training',
            instructions: 'Practice maintaining confidence under pressure and unexpected challenges.',
            duration: 600,
            expectedOutcomes: ['Stress resilience', 'Quick recovery', 'Maintained composure']
          },
          {
            id: 'conf-2-3',
            type: 'practice',
            title: 'Authentic Confidence Expression',
            instructions: 'Develop your unique confident speaking style that feels natural.',
            duration: 480,
            prompts: [
              'Find your authentic voice',
              'Express confidence naturally',
              'Avoid copying others'
            ]
          }
        ],
        isPremium: true,
        thumbnailUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
        order: 6,
        personalizedFor: ['presentations', 'interviews']
      },

      {
        id: 'confidence-3',
        title: 'Executive Presence Mastery',
        description: 'Develop the commanding presence and confidence needed for leadership roles.',
        duration: 35,
        difficulty: 'advanced',
        category: 'confidence',
        objectives: [
          'Master executive-level presence',
          'Develop authoritative communication',
          'Learn to inspire confidence in others',
          'Handle high-stakes situations'
        ],
        exercises: [
          {
            id: 'conf-3-1',
            type: 'practice',
            title: 'Executive Presence Development',
            instructions: 'Practice commanding attention and respect through presence alone.',
            duration: 720,
            prompts: [
              'Enter rooms with purpose',
              'Command attention without demanding it',
              'Project calm authority'
            ]
          },
          {
            id: 'conf-3-2',
            type: 'interactive',
            title: 'High-Stakes Communication',
            instructions: 'Practice delivering critical messages with confidence and clarity.',
            duration: 600,
            expectedOutcomes: ['Unshakeable composure', 'Clear decision-making', 'Inspiring leadership']
          },
          {
            id: 'conf-3-3',
            type: 'practice',
            title: 'Crisis Communication Leadership',
            instructions: 'Learn to maintain confidence and lead others during challenging situations.',
            duration: 540,
            prompts: [
              'Stay calm under pressure',
              'Communicate with clarity',
              'Inspire confidence in others'
            ]
          }
        ],
        isPremium: true,
        thumbnailUrl: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400',
        order: 7,
        personalizedFor: ['presentations']
      },

      // CLARITY CATEGORY - Premium Lessons
      {
        id: 'clarity-2',
        title: 'Advanced Speech Clarity',
        description: 'Master advanced vocal techniques for crystal-clear communication.',
        duration: 28,
        difficulty: 'intermediate',
        category: 'clarity',
        objectives: [
          'Perfect articulation techniques',
          'Master complex vocal patterns',
          'Develop signature vocal style',
          'Handle difficult pronunciation'
        ],
        exercises: [
          {
            id: 'clar-2-1',
            type: 'practice',
            title: 'Advanced Articulation Drills',
            instructions: 'Practice complex articulation exercises for perfect clarity.',
            duration: 480,
            prompts: [
              'Focus on difficult consonant combinations',
              'Practice rapid articulation',
              'Maintain clarity at all speeds'
            ]
          },
          {
            id: 'clar-2-2',
            type: 'interactive',
            title: 'Vocal Signature Development',
            instructions: 'Develop your unique vocal style while maintaining clarity.',
            duration: 540,
            expectedOutcomes: ['Distinctive voice', 'Memorable delivery', 'Professional sound']
          },
          {
            id: 'clar-2-3',
            type: 'practice',
            title: 'Complex Content Delivery',
            instructions: 'Practice delivering complex information with perfect clarity.',
            duration: 420,
            prompts: [
              'Break down complex concepts',
              'Use clear transitions',
              'Maintain audience understanding'
            ]
          }
        ],
        isPremium: true,
        thumbnailUrl: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=400',
        order: 8,
        personalizedFor: ['academic', 'presentations']
      },

      {
        id: 'clarity-3',
        title: 'Multilingual Clarity Mastery',
        description: 'Perfect your clarity when speaking in multiple languages or with accents.',
        duration: 32,
        difficulty: 'advanced',
        category: 'clarity',
        objectives: [
          'Master accent modification techniques',
          'Perfect cross-language clarity',
          'Develop cultural communication awareness',
          'Handle language switching smoothly'
        ],
        exercises: [
          {
            id: 'clar-3-1',
            type: 'practice',
            title: 'Accent Refinement',
            instructions: 'Practice refining your accent for maximum clarity and professionalism.',
            duration: 600,
            prompts: [
              'Focus on challenging sounds',
              'Practice rhythm and intonation',
              'Maintain natural expression'
            ]
          },
          {
            id: 'clar-3-2',
            type: 'interactive',
            title: 'Cultural Communication Adaptation',
            instructions: 'Learn to adapt your communication style for different cultural contexts.',
            duration: 720,
            expectedOutcomes: ['Cultural sensitivity', 'Adaptive communication', 'Global presence']
          },
          {
            id: 'clar-3-3',
            type: 'practice',
            title: 'Professional Multilingual Delivery',
            instructions: 'Master professional communication across languages and cultures.',
            duration: 480,
            prompts: [
              'Maintain professionalism across languages',
              'Adapt to cultural expectations',
              'Project global competence'
            ]
          }
        ],
        isPremium: true,
        thumbnailUrl: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=400',
        order: 9,
        personalizedFor: ['presentations', 'academic']
      },

      // BODY LANGUAGE CATEGORY - Premium Lessons
      {
        id: 'body-language-2',
        title: 'Advanced Body Language Mastery',
        description: 'Master sophisticated non-verbal communication for maximum impact.',
        duration: 30,
        difficulty: 'intermediate',
        category: 'body-language',
        objectives: [
          'Master advanced gesture choreography',
          'Develop commanding stage presence',
          'Learn to read and respond to audience body language',
          'Perfect movement and positioning'
        ],
        exercises: [
          {
            id: 'body-2-1',
            type: 'practice',
            title: 'Gesture Choreography',
            instructions: 'Practice coordinating sophisticated gestures with your message.',
            duration: 540,
            prompts: [
              'Plan gestures for maximum impact',
              'Practice smooth transitions',
              'Ensure gestures enhance meaning'
            ]
          },
          {
            id: 'body-2-2',
            type: 'interactive',
            title: 'Stage Presence Mastery',
            instructions: 'Develop commanding presence that captivates any audience.',
            duration: 600,
            expectedOutcomes: ['Magnetic presence', 'Audience captivation', 'Professional authority']
          },
          {
            id: 'body-2-3',
            type: 'practice',
            title: 'Audience Reading Skills',
            instructions: 'Learn to read and respond to audience body language in real-time.',
            duration: 480,
            prompts: [
              'Identify engagement signals',
              'Adapt to audience feedback',
              'Maintain connection throughout'
            ]
          }
        ],
        isPremium: true,
        thumbnailUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
        order: 10,
        personalizedFor: ['presentations', 'public-speaking']
      },

      {
        id: 'body-language-3',
        title: 'Cultural Body Language Mastery',
        description: 'Master body language across different cultural contexts and settings.',
        duration: 28,
        difficulty: 'advanced',
        category: 'body-language',
        objectives: [
          'Understand cultural body language differences',
          'Adapt non-verbal communication appropriately',
          'Master international business etiquette',
          'Develop cultural sensitivity in gestures'
        ],
        exercises: [
          {
            id: 'body-3-1',
            type: 'practice',
            title: 'Cultural Gesture Adaptation',
            instructions: 'Practice adapting your gestures for different cultural contexts.',
            duration: 480,
            prompts: [
              'Learn culturally appropriate gestures',
              'Avoid potentially offensive movements',
              'Adapt to cultural expectations'
            ]
          },
          {
            id: 'body-3-2',
            type: 'interactive',
            title: 'International Business Presence',
            instructions: 'Develop body language skills for international business settings.',
            duration: 600,
            expectedOutcomes: ['Cultural competence', 'International presence', 'Professional adaptability']
          },
          {
            id: 'body-3-3',
            type: 'practice',
            title: 'Cross-Cultural Communication',
            instructions: 'Master non-verbal communication that transcends cultural boundaries.',
            duration: 420,
            prompts: [
              'Use universal positive signals',
              'Avoid cultural misunderstandings',
              'Build cross-cultural rapport'
            ]
          }
        ],
        isPremium: true,
        thumbnailUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
        order: 11,
        personalizedFor: ['presentations', 'interviews']
      },

      // ENGAGEMENT CATEGORY - Premium Lessons
      {
        id: 'engagement-2',
        title: 'Advanced Audience Engagement',
        description: 'Master sophisticated techniques to captivate and maintain audience attention.',
        duration: 35,
        difficulty: 'intermediate',
        category: 'engagement',
        objectives: [
          'Master advanced storytelling techniques',
          'Learn interactive presentation methods',
          'Develop skills for handling Q&A sessions',
          'Create memorable and impactful presentations'
        ],
        exercises: [
          {
            id: 'eng-2-1',
            type: 'practice',
            title: 'Advanced Storytelling Mastery',
            instructions: 'Create and deliver compelling stories that drive your message home.',
            duration: 720,
            prompts: [
              'Build complex narrative structures',
              'Use emotional storytelling techniques',
              'Connect stories to business objectives'
            ]
          },
          {
            id: 'eng-2-2',
            type: 'interactive',
            title: 'Interactive Presentation Techniques',
            instructions: 'Master various methods to actively involve your audience.',
            duration: 600,
            expectedOutcomes: ['High audience participation', 'Memorable experiences', 'Active learning']
          },
          {
            id: 'eng-2-3',
            type: 'practice',
            title: 'Q&A Session Mastery',
            instructions: 'Learn to handle challenging questions and maintain control during Q&A.',
            duration: 540,
            prompts: [
              'Prepare for difficult questions',
              'Maintain message control',
              'Turn challenges into opportunities'
            ]
          }
        ],
        isPremium: true,
        thumbnailUrl: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400',
        order: 12,
        personalizedFor: ['presentations', 'public-speaking']
      },

      {
        id: 'engagement-3',
        title: 'Digital Engagement Mastery',
        description: 'Master engagement techniques for virtual and hybrid presentations.',
        duration: 30,
        difficulty: 'advanced',
        category: 'engagement',
        objectives: [
          'Master virtual presentation engagement',
          'Learn hybrid audience management',
          'Develop digital storytelling skills',
          'Handle technology challenges gracefully'
        ],
        exercises: [
          {
            id: 'eng-3-1',
            type: 'practice',
            title: 'Virtual Presence Mastery',
            instructions: 'Develop commanding presence in virtual environments.',
            duration: 600,
            prompts: [
              'Optimize your virtual setup',
              'Engage through the camera',
              'Maintain energy in virtual settings'
            ]
          },
          {
            id: 'eng-3-2',
            type: 'interactive',
            title: 'Hybrid Audience Management',
            instructions: 'Learn to engage both in-person and virtual audiences simultaneously.',
            duration: 720,
            expectedOutcomes: ['Seamless hybrid delivery', 'Equal engagement', 'Technology mastery']
          },
          {
            id: 'eng-3-3',
            type: 'practice',
            title: 'Digital Storytelling Innovation',
            instructions: 'Use digital tools and techniques to enhance your storytelling.',
            duration: 480,
            prompts: [
              'Integrate multimedia effectively',
              'Use digital tools for impact',
              'Maintain human connection'
            ]
          }
        ],
        isPremium: true,
        thumbnailUrl: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400',
        order: 13,
        personalizedFor: ['presentations', 'academic']
      },

      // SPECIALIZED PREMIUM LESSONS

      // Interview-Specific Lessons
      {
        id: 'interview-1',
        title: 'Job Interview Excellence',
        description: 'Master the art of confident and compelling job interview communication.',
        duration: 25,
        difficulty: 'intermediate',
        category: 'confidence',
        objectives: [
          'Master interview-specific confidence techniques',
          'Learn to handle difficult interview questions',
          'Develop compelling personal narratives',
          'Project professionalism and competence'
        ],
        exercises: [
          {
            id: 'int-1-1',
            type: 'practice',
            title: 'Interview Confidence Building',
            instructions: 'Build unshakeable confidence for any interview situation.',
            duration: 480,
            prompts: [
              'Prepare mentally for interviews',
              'Handle interview anxiety',
              'Project confidence from the start'
            ]
          },
          {
            id: 'int-1-2',
            type: 'interactive',
            title: 'Difficult Question Mastery',
            instructions: 'Learn to handle challenging and unexpected interview questions.',
            duration: 600,
            expectedOutcomes: ['Composed responses', 'Strategic thinking', 'Professional recovery']
          },
          {
            id: 'int-1-3',
            type: 'practice',
            title: 'Personal Brand Communication',
            instructions: 'Develop and communicate your unique professional brand.',
            duration: 420,
            prompts: [
              'Define your unique value',
              'Communicate achievements effectively',
              'Tell compelling career stories'
            ]
          }
        ],
        isPremium: true,
        thumbnailUrl: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400',
        order: 14,
        personalizedFor: ['interviews']
      },

      // Academic-Specific Lessons
      {
        id: 'academic-1',
        title: 'Academic Presentation Mastery',
        description: 'Excel in academic presentations, conferences, and scholarly communication.',
        duration: 32,
        difficulty: 'intermediate',
        category: 'clarity',
        objectives: [
          'Master academic presentation structure',
          'Learn to communicate complex ideas clearly',
          'Develop scholarly presence',
          'Handle academic Q&A sessions'
        ],
        exercises: [
          {
            id: 'acad-1-1',
            type: 'practice',
            title: 'Complex Concept Communication',
            instructions: 'Learn to explain complex academic concepts clearly and engagingly.',
            duration: 600,
            prompts: [
              'Break down complex ideas',
              'Use appropriate academic language',
              'Maintain audience understanding'
            ]
          },
          {
            id: 'acad-1-2',
            type: 'interactive',
            title: 'Academic Conference Presentation',
            instructions: 'Master the art of compelling academic conference presentations.',
            duration: 720,
            expectedOutcomes: ['Scholarly authority', 'Clear communication', 'Professional presence']
          },
          {
            id: 'acad-1-3',
            type: 'practice',
            title: 'Research Defense Skills',
            instructions: 'Develop skills for defending your research and ideas confidently.',
            duration: 540,
            prompts: [
              'Present research compellingly',
              'Handle critical questions',
              'Defend ideas professionally'
            ]
          }
        ],
        isPremium: true,
        thumbnailUrl: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=400',
        order: 15,
        personalizedFor: ['academic']
      },

      // Public Speaking Specific
      {
        id: 'public-speaking-1',
        title: 'Large Audience Mastery',
        description: 'Master the unique challenges of speaking to large audiences.',
        duration: 40,
        difficulty: 'advanced',
        category: 'engagement',
        objectives: [
          'Master large venue presentation skills',
          'Learn to project to large audiences',
          'Develop stage presence for big stages',
          'Handle large audience dynamics'
        ],
        exercises: [
          {
            id: 'pub-1-1',
            type: 'practice',
            title: 'Large Venue Projection',
            instructions: 'Learn to project your voice and presence to large audiences.',
            duration: 600,
            prompts: [
              'Project to the back row',
              'Use gestures for large spaces',
              'Maintain energy for large groups'
            ]
          },
          {
            id: 'pub-1-2',
            type: 'interactive',
            title: 'Stage Presence for Large Venues',
            instructions: 'Develop commanding stage presence for large speaking venues.',
            duration: 720,
            expectedOutcomes: ['Commanding presence', 'Large audience connection', 'Professional authority']
          },
          {
            id: 'pub-1-3',
            type: 'practice',
            title: 'Crowd Psychology Management',
            instructions: 'Learn to read and manage large audience dynamics.',
            duration: 480,
            prompts: [
              'Read crowd energy',
              'Adapt to audience mood',
              'Maintain control and engagement'
            ]
          }
        ],
        isPremium: true,
        thumbnailUrl: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=400',
        order: 16,
        personalizedFor: ['public-speaking']
      }
    ];
  }

  getAllLessons(): Lesson[] {
    return [...this.lessons].sort((a, b) => a.order - b.order);
  }

  getAvailableLessons(isPremium: boolean): Lesson[] {
    if (isPremium) {
      return this.getAllLessons();
    }
    // Free users get first 5 lessons (one from each category plus one comprehensive)
    return this.lessons.filter(lesson => !lesson.isPremium);
  }

  getPersonalizedLessons(userPreferences: {
    goals?: string[];
    experience?: string;
    focusAreas?: string[];
  }, isPremium: boolean): Lesson[] {
    const availableLessons = this.getAvailableLessons(isPremium);
    
    if (!userPreferences.goals || userPreferences.goals.length === 0) {
      return availableLessons;
    }

    // Filter lessons based on user goals and focus areas
    const personalizedLessons = availableLessons.filter(lesson => {
      // Check if lesson is personalized for user's goals
      const matchesGoals = lesson.personalizedFor?.some(goal => 
        userPreferences.goals?.includes(goal)
      ) ?? true;

      // Check if lesson category matches user's focus areas
      const matchesFocusAreas = userPreferences.focusAreas?.includes(lesson.category) ?? true;

      return matchesGoals || matchesFocusAreas;
    });

    // Sort by relevance to user preferences
    return personalizedLessons.sort((a, b) => {
      const aRelevance = this.calculateLessonRelevance(a, userPreferences);
      const bRelevance = this.calculateLessonRelevance(b, userPreferences);
      return bRelevance - aRelevance;
    });
  }

  private calculateLessonRelevance(lesson: Lesson, userPreferences: {
    goals?: string[];
    experience?: string;
    focusAreas?: string[];
  }): number {
    let relevance = 0;

    // Goal matching (highest weight)
    if (lesson.personalizedFor && userPreferences.goals) {
      const goalMatches = lesson.personalizedFor.filter(goal => 
        userPreferences.goals?.includes(goal)
      ).length;
      relevance += goalMatches * 3;
    }

    // Focus area matching (medium weight)
    if (userPreferences.focusAreas?.includes(lesson.category)) {
      relevance += 2;
    }

    // Experience level matching (low weight)
    if (userPreferences.experience === lesson.difficulty) {
      relevance += 1;
    }

    return relevance;
  }

  getLessonById(id: string): Lesson | null {
    return this.lessons.find(lesson => lesson.id === id) || null;
  }

  getLessonsByCategory(category: Lesson['category'], isPremium: boolean): Lesson[] {
    const availableLessons = this.getAvailableLessons(isPremium);
    return availableLessons.filter(lesson => lesson.category === category);
  }

  getLessonsByDifficulty(difficulty: Lesson['difficulty'], isPremium: boolean): Lesson[] {
    const availableLessons = this.getAvailableLessons(isPremium);
    return availableLessons.filter(lesson => lesson.difficulty === difficulty);
  }

  getAdaptiveLesson(lessonId: string, userExperience: string): Lesson | null {
    const lesson = this.getLessonById(lessonId);
    if (!lesson) return null;

    // Create adaptive version based on user experience
    const adaptiveLesson = { ...lesson };
    
    adaptiveLesson.exercises = lesson.exercises.map(exercise => {
      const adaptiveExercise = { ...exercise };
      
      // Use adaptive instructions if available
      if (exercise.adaptiveInstructions && exercise.adaptiveInstructions[userExperience as keyof typeof exercise.adaptiveInstructions]) {
        adaptiveExercise.instructions = exercise.adaptiveInstructions[userExperience as keyof typeof exercise.adaptiveInstructions] || exercise.instructions;
      }

      // Adjust duration based on experience level
      if (userExperience === 'beginner') {
        adaptiveExercise.duration = Math.round(exercise.duration * 1.2); // 20% longer for beginners
      } else if (userExperience === 'advanced') {
        adaptiveExercise.duration = Math.round(exercise.duration * 0.8); // 20% shorter for advanced
      }

      return adaptiveExercise;
    });

    return adaptiveLesson;
  }

  startLesson(lessonId: string, userId: string): LessonProgress {
    const lesson = this.getLessonById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const progress: LessonProgress = {
      lessonId,
      userId,
      completed: false,
      progress: 0,
      startedAt: new Date().toISOString(),
      scores: {
        confidence: 0,
        clarity: 0,
        engagement: 0,
        overall: 0,
      },
      feedback: [],
    };

    this.userProgress.set(`${userId}-${lessonId}`, progress);
    return progress;
  }

  updateLessonProgress(
    lessonId: string,
    userId: string,
    updates: Partial<LessonProgress>
  ): LessonProgress | null {
    const key = `${userId}-${lessonId}`;
    const currentProgress = this.userProgress.get(key);
    
    if (!currentProgress) {
      return null;
    }

    const updatedProgress = { ...currentProgress, ...updates };
    this.userProgress.set(key, updatedProgress);
    
    return updatedProgress;
  }

  completeLesson(
    lessonId: string,
    userId: string,
    finalScores: LessonProgress['scores'],
    feedback: string[],
    personalizedFeedback?: string[]
  ): LessonProgress | null {
    const key = `${userId}-${lessonId}`;
    const progress = this.userProgress.get(key);
    
    if (!progress) {
      return null;
    }

    const completedProgress: LessonProgress = {
      ...progress,
      completed: true,
      progress: 100,
      completedAt: new Date().toISOString(),
      scores: finalScores,
      feedback,
      personalizedFeedback,
    };

    this.userProgress.set(key, completedProgress);
    return completedProgress;
  }

  getUserProgress(userId: string): LessonProgress[] {
    const userProgressList: LessonProgress[] = [];
    
    for (const [key, progress] of this.userProgress.entries()) {
      if (key.startsWith(`${userId}-`)) {
        userProgressList.push(progress);
      }
    }
    
    return userProgressList.sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  getLessonProgress(lessonId: string, userId: string): LessonProgress | null {
    return this.userProgress.get(`${userId}-${lessonId}`) || null;
  }

  getCompletedLessons(userId: string): Lesson[] {
    const userProgress = this.getUserProgress(userId);
    const completedLessonIds = userProgress
      .filter(progress => progress.completed)
      .map(progress => progress.lessonId);
    
    return this.lessons.filter(lesson => completedLessonIds.includes(lesson.id));
  }

  getRecommendedNextLesson(userId: string, isPremium: boolean, userPreferences?: {
    goals?: string[];
    experience?: string;
    focusAreas?: string[];
  }): Lesson | null {
    const userProgress = this.getUserProgress(userId);
    const completedLessonIds = userProgress
      .filter(progress => progress.completed)
      .map(progress => progress.lessonId);

    // Get personalized lessons if preferences are available
    const availableLessons = userPreferences 
      ? this.getPersonalizedLessons(userPreferences, isPremium)
      : this.getAvailableLessons(isPremium);

    // Find the first lesson that hasn't been completed
    const nextLesson = availableLessons.find(lesson => !completedLessonIds.includes(lesson.id));
    
    // If user preferences are available, return adaptive version
    if (nextLesson && userPreferences?.experience) {
      return this.getAdaptiveLesson(nextLesson.id, userPreferences.experience);
    }

    return nextLesson || null;
  }

  getUserStats(userId: string): {
    totalLessons: number;
    completedLessons: number;
    averageScore: number;
    totalPracticeTime: number;
    strongestArea: string;
    improvementArea: string;
    categoryProgress: Record<string, { completed: number; total: number; averageScore: number }>;
  } {
    const userProgress = this.getUserProgress(userId);
    const completedProgress = userProgress.filter(p => p.completed);
    
    if (completedProgress.length === 0) {
      return {
        totalLessons: 0,
        completedLessons: 0,
        averageScore: 0,
        totalPracticeTime: 0,
        strongestArea: 'confidence',
        improvementArea: 'clarity',
        categoryProgress: {},
      };
    }

    const totalScores = completedProgress.reduce(
      (acc, progress) => ({
        confidence: acc.confidence + progress.scores.confidence,
        clarity: acc.clarity + progress.scores.clarity,
        engagement: acc.engagement + progress.scores.engagement,
        overall: acc.overall + progress.scores.overall,
      }),
      { confidence: 0, clarity: 0, engagement: 0, overall: 0 }
    );

    const avgScores = {
      confidence: totalScores.confidence / completedProgress.length,
      clarity: totalScores.clarity / completedProgress.length,
      engagement: totalScores.engagement / completedProgress.length,
      overall: totalScores.overall / completedProgress.length,
    };

    const areas = Object.entries(avgScores).filter(([key]) => key !== 'overall');
    const strongestArea = areas.reduce((a, b) => a[1] > b[1] ? a : b)[0];
    const improvementArea = areas.reduce((a, b) => a[1] < b[1] ? a : b)[0];

    // Calculate total practice time from lesson durations
    const totalPracticeTime = completedProgress.reduce((total, progress) => {
      const lesson = this.getLessonById(progress.lessonId);
      return total + (lesson ? lesson.duration * 60 : 0); // Convert minutes to seconds
    }, 0);

    // Calculate category progress
    const categoryProgress: Record<string, { completed: number; total: number; averageScore: number }> = {};
    const categories = ['confidence', 'clarity', 'body-language', 'engagement'];
    
    categories.forEach(category => {
      const categoryLessons = this.lessons.filter(l => l.category === category);
      const completedCategoryLessons = completedProgress.filter(p => {
        const lesson = this.getLessonById(p.lessonId);
        return lesson?.category === category;
      });
      
      const avgCategoryScore = completedCategoryLessons.length > 0
        ? completedCategoryLessons.reduce((sum, p) => sum + p.scores.overall, 0) / completedCategoryLessons.length
        : 0;

      categoryProgress[category] = {
        completed: completedCategoryLessons.length,
        total: categoryLessons.length,
        averageScore: Math.round(avgCategoryScore),
      };
    });

    return {
      totalLessons: userProgress.length,
      completedLessons: completedProgress.length,
      averageScore: Math.round(avgScores.overall),
      totalPracticeTime,
      strongestArea,
      improvementArea,
      categoryProgress,
    };
  }

  // Get lessons count by plan
  getLessonCounts(): { free: number; premium: number; total: number } {
    const freeLessons = this.lessons.filter(l => !l.isPremium).length;
    const premiumLessons = this.lessons.filter(l => l.isPremium).length;
    
    return {
      free: freeLessons,
      premium: premiumLessons,
      total: this.lessons.length,
    };
  }
}

export const lessonsService = new LessonsService();
export default lessonsService;