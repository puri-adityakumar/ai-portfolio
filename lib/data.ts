import { PortfolioData, ChatMessage } from '@/types/portfolio';
import portfolioData from '@/data.json';

/**
 * Load portfolio data from the JSON file
 * This serves as the single source of truth for all portfolio information
 */
export function getPortfolioData(): PortfolioData {
  return portfolioData as PortfolioData;
}

/**
 * Create contextual portfolio summary based on user query
 * This helps provide more relevant context for specific questions
 */
export function createContextualSummary(data: PortfolioData, userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  // Determine what aspects to emphasize based on the user's question
  const isAboutExperience = message.includes('experience') || message.includes('work') || message.includes('job');
  const isAboutProjects = message.includes('project') || message.includes('built') || message.includes('created');
  const isAboutSkills = message.includes('skill') || message.includes('technology') || message.includes('tech');
  const isAboutEducation = message.includes('education') || message.includes('study') || message.includes('degree');
  const isAboutAchievements = message.includes('achievement') || message.includes('award') || message.includes('recognition');

  let contextualInfo = '';

  if (isAboutExperience) {
    contextualInfo += `\n\nRELEVANT EXPERIENCE DETAILS:
${data.experiences.map(exp => `
${exp.role} at ${exp.company} (${exp.period})
${exp.highlights.slice(0, 2).map(h => `• ${h}`).join('\n')}
`).join('')}`;
  }

  if (isAboutProjects) {
    contextualInfo += `\n\nRELEVANT PROJECT DETAILS:
${data.projects.filter(p => p.featured).map(project => `
${project.name}: ${project.description}
Key highlights: ${project.highlights.slice(0, 2).join(', ')}
`).join('')}`;
  }

  if (isAboutSkills) {
    contextualInfo += `\n\nRELEVANT TECHNICAL SKILLS:
Core Languages: ${data.skills.languages.slice(0, 3).join(', ')}
Key Frameworks: ${data.skills.frameworks.slice(0, 4).join(', ')}
Cloud & DevOps: ${data.skills.devops.slice(0, 4).join(', ')}`;
  }

  if (isAboutEducation) {
    contextualInfo += `\n\nEDUCATION DETAILS:
${data.education.map(edu => `${edu.degree} from ${edu.institution} (${edu.period})`).join('\n')}`;
  }

  if (isAboutAchievements) {
    contextualInfo += `\n\nACHIEVEMENTS & RECOGNITION:
${data.achievements.map(ach => `${ach.title} - ${ach.organization} (${ach.date})`).join('\n')}`;
  }

  return contextualInfo;
}

/**
 * Manage conversation context length to prevent token limit issues
 * Truncates context if it exceeds reasonable limits while preserving important information
 */
export function manageContextLength(
  portfolioContext: string, 
  contextualInfo: string, 
  conversationHistory: string,
  maxLength: number = 8000
): string {
  const fullContext = portfolioContext + contextualInfo + conversationHistory;
  
  if (fullContext.length <= maxLength) {
    return fullContext;
  }

  // If context is too long, prioritize portfolio context and recent conversation
  const priorityContext = portfolioContext + conversationHistory;
  
  if (priorityContext.length <= maxLength) {
    return priorityContext;
  }

  // If still too long, truncate conversation history
  const truncatedHistory = conversationHistory.substring(
    Math.max(0, conversationHistory.length - (maxLength - portfolioContext.length))
  );
  
  return portfolioContext + truncatedHistory;
}

/**
 * Extract key topics from user message for better context relevance
 */
export function extractTopicsFromMessage(message: string): string[] {
  const topics: string[] = [];
  const lowerMessage = message.toLowerCase();
  
  // Technical topics
  if (lowerMessage.includes('javascript') || lowerMessage.includes('js')) topics.push('JavaScript');
  if (lowerMessage.includes('python')) topics.push('Python');
  if (lowerMessage.includes('react')) topics.push('React');
  if (lowerMessage.includes('next') || lowerMessage.includes('nextjs')) topics.push('Next.js');
  if (lowerMessage.includes('aws') || lowerMessage.includes('cloud')) topics.push('AWS/Cloud');
  if (lowerMessage.includes('ai') || lowerMessage.includes('machine learning') || lowerMessage.includes('ml')) topics.push('AI/ML');
  
  // Experience topics
  if (lowerMessage.includes('faralpha')) topics.push('FarAlpha Experience');
  if (lowerMessage.includes('webguru')) topics.push('WebGuru Experience');
  
  // Project topics
  if (lowerMessage.includes('clariq')) topics.push('Clariq Project');
  if (lowerMessage.includes('healer') || lowerMessage.includes('healthcare')) topics.push('HealerAI Project');
  if (lowerMessage.includes('justplanit')) topics.push('JustPlanIt Project');
  
  return topics;
}

/**
 * Format portfolio data for LLM consumption
 * Creates a comprehensive context string for AI chat interactions
 */
export function formatPortfolioForLLM(data: PortfolioData): string {
  return `You are an AI assistant representing ${data.profile.name}, a ${data.profile.title} based in ${data.profile.location}.

INSTRUCTIONS:
- Answer questions about ${data.profile.name}'s professional background, experience, and skills
- Be conversational, helpful, and provide specific details when asked
- Use the information provided below as your knowledge base
- If asked about something not in the portfolio, politely indicate that information isn't available
- Maintain a professional yet friendly tone throughout the conversation

PROFILE OVERVIEW:
Name: ${data.profile.name}
Title: ${data.profile.title}
Location: ${data.profile.location}
Bio: ${data.profile.bio}

CONTACT INFORMATION:
- Email: ${data.profile.email}
- Phone: ${data.profile.phone}
- GitHub: ${data.profile.githubUrl}
- LinkedIn: ${data.profile.linkedinUrl}

PROFESSIONAL EXPERIENCE:
${data.experiences.map(exp => `
${exp.role} at ${exp.company} (${exp.period})
Location: ${exp.location}
Status: ${exp.current ? 'Current Position' : 'Previous Position'}

Key Accomplishments:
${exp.highlights.map(highlight => `• ${highlight}`).join('\n')}

Technologies Used: ${exp.technologies.join(', ')}
`).join('\n')}

FEATURED PROJECTS:
${data.projects.map(project => `
${project.name}${project.featured ? ' ⭐ (Featured Project)' : ''}
Description: ${project.description}

Key Highlights:
${project.highlights.map(highlight => `• ${highlight}`).join('\n')}

Technology Stack: ${project.techStack.join(', ')}${project.githubUrl ? `
GitHub Repository: ${project.githubUrl}` : ''}${project.liveUrl ? `
Live Demo: ${project.liveUrl}` : ''}
`).join('\n')}

TECHNICAL SKILLS:
Programming Languages: ${data.skills.languages.join(', ')}
Frameworks & Libraries: ${data.skills.frameworks.join(', ')}
DevOps & Cloud Technologies: ${data.skills.devops.join(', ')}
Tools & Platforms: ${data.skills.tools.join(', ')}

ACHIEVEMENTS & RECOGNITION:
${data.achievements.map(achievement => `
${achievement.title} (${achievement.date})
Organization: ${achievement.organization}
Category: ${achievement.category}
Details: ${achievement.description}${achievement.link ? `
Reference: ${achievement.link}` : ''}
`).join('\n')}

EDUCATIONAL BACKGROUND:
${data.education.map(edu => `
${edu.degree} in ${edu.field}
Institution: ${edu.institution}
Location: ${edu.location}
Duration: ${edu.period}${edu.current ? ' (Currently Enrolled)' : ' (Completed)'}
`).join('\n')}`;
}