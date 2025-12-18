// CGI Knowledge Graph Mock Data

export interface Skill {
  id: string;
  name: string;
  cognitiveLevel: 'Knowing' | 'Applying' | 'Reasoning';
}

export interface Subtopic {
  id: string;
  name: string;
  skills: Skill[];
}

export interface LearningOutcome {
  id: string;
  description: string;
  subtopics: Subtopic[];
}

export interface Topic {
  id: string;
  name: string;
  ncfseCompetency: string;
  learningOutcomeDescription: string;
  learningOutcomes: LearningOutcome[];
}

export interface Strand {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  name: string;
  strands: Strand[];
}

export interface Grade {
  id: string;
  name: string;
  subjects: Subject[];
}

export interface KnowledgeGraph {
  id: string;
  name: string;
  displayName: string;
  grades: Grade[];
}

export const CGI_KNOWLEDGE_GRAPH: KnowledgeGraph = {
  id: 'cgi-kg',
  name: 'cgi_kg',
  displayName: 'CGI KG',
  grades: [
    {
      id: '8',
      name: 'Grade 8',
      subjects: [
        {
          id: 'hindi',
          name: 'Hindi',
          strands: [
            {
              id: 'vocabulary',
              name: 'Vocabulary',
              topics: [
                {
                  id: 'HI_8_VO',
                  name: 'Vocabulary - Grade 8',
                  ncfseCompetency: `Curricular Goal 2 - Develops an appreciation of the distinctive features of the particular language, including its alphabet and script, sounds, rhymes, puns, and other wordplays and games unique to the language. Competency: Engages in the use of puns, rhymes, alliteration, and other wordplays in the language, to make speech and writing more interesting and enjoyable`,
                  learningOutcomeDescription: 'छात्र नए शब्दों के प्रति जिज्ञासा रखते हैं और संदर्भ के अनुसार उनका सही प्रयोग करना सीखते हैं।',
                  learningOutcomes: [
                    {
                      id: 'HI_8_VO_L1',
                      description: 'कक्षा 8 के छात्र विविध प्रकार की शब्दावली, जैसे समानार्थक शब्द, विलोम शब्द, तद्भव-तत्सम, श्रुतिसमभिन्नार्थक शब्द, शब्द-समूह, मुहावरे, तुकांत शब्द को समझते हैं और उपयुक्त प्रयोग करते हैं। संदर्भानुसार शब्दों का अपनी मौखिक एवं लिखित भाषा में सटीक और प्रभावी प्रयोग कर पाते हैं।',
                      subtopics: [
                        {
                          id: 'HI_8_VO_L1_SHN',
                          name: 'शब्द निर्माण - Grade 8',
                          skills: [
                            {
                              id: 'HI_8_VO_L1_SHN_S1',
                              name: 'G 8 - शब्दों में प्रयोग हुए उपसर्ग और प्रत्यय की पहचान कर पाते हैं।',
                              cognitiveLevel: 'Knowing'
                            },
                            {
                              id: 'HI_8_VO_L1_SHN_S2',
                              name: 'G 8 - उपसर्ग और प्रत्यय का प्रयोग कर नये शब्दों का निर्माण कर पाते हैं।',
                              cognitiveLevel: 'Applying'
                            },
                            {
                              id: 'HI_8_VO_L1_SHN_S3',
                              name: 'G 8 - शब्द-रचना में उपसर्ग–प्रत्यय के प्रभाव का विश्लेषण कर सही अर्थ, रूप और प्रयोग का तर्कसंगत निर्णय ले पाते हैं।',
                              cognitiveLevel: 'Reasoning'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              id: 'grammar',
              name: 'Grammar',
              topics: [
                {
                  id: 'HI_8_GR',
                  name: 'Grammar - Grade 8',
                  ncfseCompetency: 'Curricular Goal 3 - Understanding grammatical concepts and applying them in written and spoken language.',
                  learningOutcomeDescription: 'छात्र व्याकरण के नियमों को समझते हैं और उनका प्रयोग करते हैं।',
                  learningOutcomes: [
                    {
                      id: 'HI_8_GR_L1',
                      description: 'कक्षा 8 के छात्र संज्ञा, सर्वनाम, क्रिया और विशेषण के भेदों को पहचानते हैं।',
                      subtopics: [
                        {
                          id: 'HI_8_GR_L1_SNJ',
                          name: 'संज्ञा - Grade 8',
                          skills: [
                            {
                              id: 'HI_8_GR_L1_SNJ_S1',
                              name: 'G 8 - संज्ञा के विभिन्न भेदों की पहचान करते हैं।',
                              cognitiveLevel: 'Knowing'
                            },
                            {
                              id: 'HI_8_GR_L1_SNJ_S2',
                              name: 'G 8 - वाक्यों में संज्ञा का उचित प्रयोग करते हैं।',
                              cognitiveLevel: 'Applying'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'math',
          name: 'Mathematics',
          strands: [
            {
              id: 'algebra',
              name: 'Algebra',
              topics: [
                {
                  id: 'MA_8_AL',
                  name: 'Algebra - Grade 8',
                  ncfseCompetency: 'Curricular Goal 1 - Develops algebraic thinking and problem-solving skills.',
                  learningOutcomeDescription: 'Students understand algebraic expressions and equations.',
                  learningOutcomes: [
                    {
                      id: 'MA_8_AL_L1',
                      description: 'Grade 8 students can solve linear equations and understand variables.',
                      subtopics: [
                        {
                          id: 'MA_8_AL_L1_LE',
                          name: 'Linear Equations - Grade 8',
                          skills: [
                            {
                              id: 'MA_8_AL_L1_LE_S1',
                              name: 'G 8 - Identifies linear equations in one variable.',
                              cognitiveLevel: 'Knowing'
                            },
                            {
                              id: 'MA_8_AL_L1_LE_S2',
                              name: 'G 8 - Solves linear equations using appropriate methods.',
                              cognitiveLevel: 'Applying'
                            },
                            {
                              id: 'MA_8_AL_L1_LE_S3',
                              name: 'G 8 - Analyzes word problems and forms linear equations.',
                              cognitiveLevel: 'Reasoning'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: '9',
      name: 'Grade 9',
      subjects: [
        {
          id: 'hindi',
          name: 'Hindi',
          strands: [
            {
              id: 'vocabulary',
              name: 'Vocabulary',
              topics: [
                {
                  id: 'HI_9_VO',
                  name: 'Vocabulary - Grade 9',
                  ncfseCompetency: 'Curricular Goal 2 - Advanced vocabulary development.',
                  learningOutcomeDescription: 'छात्र उन्नत शब्दावली का प्रयोग करते हैं।',
                  learningOutcomes: [
                    {
                      id: 'HI_9_VO_L1',
                      description: 'कक्षा 9 के छात्र साहित्यिक शब्दावली को समझते हैं।',
                      subtopics: [
                        {
                          id: 'HI_9_VO_L1_SAH',
                          name: 'साहित्यिक शब्द - Grade 9',
                          skills: [
                            {
                              id: 'HI_9_VO_L1_SAH_S1',
                              name: 'G 9 - साहित्यिक शब्दों की पहचान करते हैं।',
                              cognitiveLevel: 'Knowing'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// Available Knowledge Graphs
export const AVAILABLE_KNOWLEDGE_GRAPHS: KnowledgeGraph[] = [
  CGI_KNOWLEDGE_GRAPH
];

// Helper functions to get filtered data
export const getSubjectsForGrade = (kg: KnowledgeGraph, gradeId: string): Subject[] => {
  const grade = kg.grades.find(g => g.id === gradeId);
  return grade?.subjects || [];
};

export const getStrandsForSubject = (kg: KnowledgeGraph, gradeId: string, subjectId: string): Strand[] => {
  const subjects = getSubjectsForGrade(kg, gradeId);
  const subject = subjects.find(s => s.id === subjectId);
  return subject?.strands || [];
};

export const getTopicsForStrand = (kg: KnowledgeGraph, gradeId: string, subjectId: string, strandId: string): Topic[] => {
  const strands = getStrandsForSubject(kg, gradeId, subjectId);
  const strand = strands.find(s => s.id === strandId);
  return strand?.topics || [];
};

export const getLOsForTopic = (kg: KnowledgeGraph, gradeId: string, subjectId: string, strandId: string, topicId: string): LearningOutcome[] => {
  const topics = getTopicsForStrand(kg, gradeId, subjectId, strandId);
  const topic = topics.find(t => t.id === topicId);
  return topic?.learningOutcomes || [];
};

export const getSubtopicsForLO = (kg: KnowledgeGraph, gradeId: string, subjectId: string, strandId: string, topicId: string, loId: string): Subtopic[] => {
  const los = getLOsForTopic(kg, gradeId, subjectId, strandId, topicId);
  const lo = los.find(l => l.id === loId);
  return lo?.subtopics || [];
};

export const getSkillsForSubtopic = (kg: KnowledgeGraph, gradeId: string, subjectId: string, strandId: string, topicId: string, loId: string, subtopicId: string): Skill[] => {
  const subtopics = getSubtopicsForLO(kg, gradeId, subjectId, strandId, topicId, loId);
  const subtopic = subtopics.find(s => s.id === subtopicId);
  return subtopic?.skills || [];
};
