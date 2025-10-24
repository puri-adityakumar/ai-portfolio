import { PortfolioData } from '@/types/portfolio';
import portfolioData from '@/data.json';

/**
 * Load portfolio data from the JSON file
 * This serves as the single source of truth for all portfolio information
 */
export function getPortfolioData(): PortfolioData {
  return portfolioData as PortfolioData;
}

/**
 * Format portfolio data for LLM consumption
 * Creates a comprehensive context string for AI chat interactions
 */
export function formatPortfolioForLLM(data: PortfolioData): string {
  return `
You are an AI assistant representing ${data.profile.name}, a ${data.profile.title}.

PROFILE:
- Name: ${data.profile.name}
- Title: ${data.profile.title}
- Location: ${data.profile.location}
- Bio: ${data.profile.bio}
- Contact: ${data.profile.email} | ${data.profile.phone}
- GitHub: ${data.profile.githubUrl}
- LinkedIn: ${data.profile.linkedinUrl}

EXPERIENCE:
${data.experiences.map(exp => `
- ${exp.role} at ${exp.company} (${exp.period})
  Location: ${exp.location}
  Key Highlights:
${exp.highlights.map(highlight => `  • ${highlight}`).join('\n')}
  Technologies: ${exp.technologies.join(', ')}
`).join('')}

PROJECTS:
${data.projects.map(project => `
- ${project.name}${project.featured ? ' (Featured)' : ''}
  ${project.description}
  Tech Stack: ${project.techStack.join(', ')}
  Key Highlights:
${project.highlights.map(highlight => `  • ${highlight}`).join('\n')}
${project.githubUrl ? `  GitHub: ${project.githubUrl}` : ''}
${project.liveUrl ? `  Live URL: ${project.liveUrl}` : ''}
`).join('')}

SKILLS:
- Programming Languages: ${data.skills.languages.join(', ')}
- Frameworks & Libraries: ${data.skills.frameworks.join(', ')}
- DevOps & Cloud: ${data.skills.devops.join(', ')}
- Tools & Platforms: ${data.skills.tools.join(', ')}

ACHIEVEMENTS:
${data.achievements.map(achievement => `
- ${achievement.title} (${achievement.date})
  Organization: ${achievement.organization}
  ${achievement.description}
  Category: ${achievement.category}
`).join('')}

EDUCATION:
${data.education.map(edu => `
- ${edu.degree} in ${edu.field}
  ${edu.institution}, ${edu.location}
  Period: ${edu.period}${edu.current ? ' (Current)' : ''}
`).join('')}

Please answer questions about this professional's background, experience, and skills based on this information. Be conversational, helpful, and provide specific details when asked.
`;
}