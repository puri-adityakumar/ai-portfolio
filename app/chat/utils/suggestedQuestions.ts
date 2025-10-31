import { PortfolioData } from '@/types/portfolio';

/**
 * Generates dynamic suggested questions based on portfolio data
 */
export function generateSuggestedQuestions(portfolioData: PortfolioData): string[] {
  const questions: string[] = [];
  
  // Basic introduction questions
  questions.push(`Tell me about ${portfolioData.profile.name}`);
  questions.push(`What is ${portfolioData.profile.name}'s background?`);
  
  // Experience-based questions
  if (portfolioData.experiences && portfolioData.experiences.length > 0) {
    const currentExp = portfolioData.experiences.find(exp => exp.current);
    const latestExp = portfolioData.experiences[0]; // Assuming sorted by recency
    
    if (currentExp) {
      questions.push(`What does ${portfolioData.profile.name} do at ${currentExp.company}?`);
    } else if (latestExp) {
      questions.push(`Tell me about the work at ${latestExp.company}`);
    }
    
    questions.push("What's the professional experience like?");
  }
  
  // Project-based questions with specific project names
  if (portfolioData.projects && portfolioData.projects.length > 0) {
    const featuredProjects = portfolioData.projects.filter(project => project.featured);
    const projectToHighlight = featuredProjects.length > 0 ? featuredProjects[0] : portfolioData.projects[0];
    
    if (projectToHighlight) {
      questions.push(`Tell me about the ${projectToHighlight.name} project`);
    }
    
    // Add questions about specific project types
    const hasAIProjects = portfolioData.projects.some(project => 
      project.description.toLowerCase().includes('ai') || 
      project.techStack.some(tech => tech.toLowerCase().includes('llm') || tech.toLowerCase().includes('langchain'))
    );
    
    if (hasAIProjects) {
      questions.push("What AI projects have you built?");
    } else {
      questions.push("What interesting projects have you built?");
    }
  }
  
  // Skills-based questions with specific technologies
  if (portfolioData.skills) {
    const hasAI = portfolioData.skills.tools?.some(tool => 
      tool.toLowerCase().includes('ai') || 
      tool.toLowerCase().includes('langchain') ||
      tool.toLowerCase().includes('llm')
    ) || portfolioData.skills.frameworks?.some(framework =>
      framework.toLowerCase().includes('langchain')
    );
    
    const hasCloud = portfolioData.skills.devops?.some(skill => 
      skill.toLowerCase().includes('aws') || 
      skill.toLowerCase().includes('azure') ||
      skill.toLowerCase().includes('cloud')
    );
    
    const hasReact = portfolioData.skills.frameworks?.some(framework =>
      framework.toLowerCase().includes('react') || framework.toLowerCase().includes('next')
    );
    
    if (hasAI) {
      questions.push("What AI/ML experience do you have?");
    }
    
    if (hasCloud) {
      questions.push("Tell me about cloud and DevOps skills");
    }
    
    if (hasReact) {
      questions.push("What's your React/Next.js experience?");
    }
    
    questions.push("What are the main technical skills?");
  }
  
  // Achievement-based questions
  if (portfolioData.achievements && portfolioData.achievements.length > 0) {
    const hackathonAchievements = portfolioData.achievements.filter(ach => 
      ach.category?.toLowerCase().includes('hackathon')
    );
    
    if (hackathonAchievements.length > 0) {
      const firstAchievement = hackathonAchievements[0];
      questions.push(`Tell me about winning ${firstAchievement.title}`);
    } else {
      questions.push("What are some notable achievements?");
    }
  }
  
  // Education-based questions
  if (portfolioData.education && portfolioData.education.length > 0) {
    const currentEducation = portfolioData.education.find(edu => edu.current);
    if (currentEducation) {
      questions.push(`Tell me about studying ${currentEducation.field}`);
    } else {
      questions.push("What's the educational background?");
    }
  }
  
  // Limit to 4 questions for a cleaner interface
  return questions.slice(0, 4);
}

/**
 * Gets contextual follow-up questions based on conversation history
 */
export function getContextualQuestions(
  portfolioData: PortfolioData, 
  conversationHistory: Array<{ message: string; isUser: boolean }>
): string[] {
  const questions: string[] = [];
  
  // Analyze recent user messages to suggest relevant follow-ups
  const recentUserMessages = conversationHistory
    .filter(msg => msg.isUser)
    .slice(-5) // Last 5 user messages for better context
    .map(msg => msg.message.toLowerCase());
  
  const hasAskedAbout = (topic: string) => 
    recentUserMessages.some(msg => msg.includes(topic.toLowerCase()));
  
  // Suggest follow-up questions based on what hasn't been asked
  if (!hasAskedAbout('experience') && !hasAskedAbout('work') && !hasAskedAbout('job')) {
    questions.push("Tell me about work experience");
  }
  
  if (!hasAskedAbout('project') && portfolioData.projects?.length > 0) {
    // Suggest specific projects that haven't been mentioned
    const unmentionedProjects = portfolioData.projects.filter(project => 
      !recentUserMessages.some(msg => msg.includes(project.name.toLowerCase()))
    );
    
    if (unmentionedProjects.length > 0) {
      const randomProject = unmentionedProjects[Math.floor(Math.random() * unmentionedProjects.length)];
      questions.push(`Tell me about the ${randomProject.name} project`);
    } else {
      questions.push("What projects have you built?");
    }
  }
  
  if (!hasAskedAbout('skill') && !hasAskedAbout('technology') && !hasAskedAbout('tech')) {
    questions.push("What technologies do you work with?");
  }
  
  if (!hasAskedAbout('achievement') && !hasAskedAbout('award') && portfolioData.achievements?.length > 0) {
    questions.push("Any notable achievements or awards?");
  }
  
  if (!hasAskedAbout('education') && !hasAskedAbout('study') && !hasAskedAbout('university')) {
    questions.push("What's your educational background?");
  }
  
  // Add some specific technical questions based on portfolio data
  if (portfolioData.skills?.frameworks?.some(f => f.includes('Next')) && !hasAskedAbout('next')) {
    questions.push("Tell me about Next.js experience");
  }
  
  if (portfolioData.skills?.devops?.includes('AWS') && !hasAskedAbout('aws') && !hasAskedAbout('cloud')) {
    questions.push("What AWS services have you worked with?");
  }
  
  // Add questions about specific companies if not asked
  if (portfolioData.experiences?.length > 0) {
    const unmentionedCompanies = portfolioData.experiences.filter(exp => 
      !recentUserMessages.some(msg => msg.includes(exp.company.toLowerCase()))
    );
    
    if (unmentionedCompanies.length > 0) {
      const randomCompany = unmentionedCompanies[Math.floor(Math.random() * unmentionedCompanies.length)];
      questions.push(`What was it like working at ${randomCompany.company}?`);
    }
  }
  
  // Add questions about specific technologies mentioned in projects
  if (portfolioData.projects?.length > 0) {
    const allTechStack = portfolioData.projects.flatMap(p => p.techStack);
    const aiTech = allTechStack.filter(tech => 
      tech.toLowerCase().includes('ai') || 
      tech.toLowerCase().includes('llm') ||
      tech.toLowerCase().includes('langchain')
    );
    
    if (aiTech.length > 0 && !hasAskedAbout('ai') && !hasAskedAbout('machine learning')) {
      questions.push("How do you work with AI and machine learning?");
    }
  }
  
  return questions.slice(0, 4); // Limit contextual questions
}