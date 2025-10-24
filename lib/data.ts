import { PortfolioData, ValidationResult } from '@/types/portfolio';
import fs from 'fs';
import path from 'path';

/**
 * Loads portfolio data from data.json file
 * @returns Promise<PortfolioData> - The parsed portfolio data
 * @throws Error if file cannot be read or parsed
 */
export async function loadPortfolioData(): Promise<PortfolioData> {
  try {
    const dataPath = path.join(process.cwd(), 'data.json');
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(fileContent) as PortfolioData;
    
    const validation = validatePortfolioData(data);
    if (!validation.isValid) {
      throw new Error(`Invalid portfolio data: ${validation.errors.join(', ')}`);
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load portfolio data: ${error.message}`);
    }
    throw new Error('Failed to load portfolio data: Unknown error');
  }
}

/**
 * Validates portfolio data structure and required fields
 * @param data - The portfolio data to validate
 * @returns ValidationResult - Object containing validation status and errors
 */
export function validatePortfolioData(data: any): ValidationResult {
  const errors: string[] = [];

  // Validate profile info
  if (!data.profile) {
    errors.push('Missing profile information');
  } else {
    const required = ['name', 'title', 'email', 'phone', 'location', 'bio', 'github', 'linkedin'];
    required.forEach(field => {
      if (!data.profile[field] || typeof data.profile[field] !== 'string') {
        errors.push(`Missing or invalid profile.${field}`);
      }
    });
  }

  // Validate skills object
  if (!data.skills) {
    errors.push('Missing skills information');
  } else {
    const skillCategories = ['languages', 'frameworks', 'devops', 'tools'];
    skillCategories.forEach(category => {
      if (!Array.isArray(data.skills[category])) {
        errors.push(`skills.${category} must be an array`);
      }
    });
  }

  // Validate experiences array
  if (!Array.isArray(data.experiences)) {
    errors.push('Experiences must be an array');
  } else {
    data.experiences.forEach((exp: any, index: number) => {
      const required = ['id', 'role', 'company', 'location', 'period', 'startDate', 'endDate'];
      required.forEach(field => {
        if (!exp[field] || typeof exp[field] !== 'string') {
          errors.push(`Missing or invalid experiences[${index}].${field}`);
        }
      });
      if (typeof exp.current !== 'boolean') {
        errors.push(`experiences[${index}].current must be a boolean`);
      }
      if (!Array.isArray(exp.highlights)) {
        errors.push(`experiences[${index}].highlights must be an array`);
      }
      if (!Array.isArray(exp.technologies)) {
        errors.push(`experiences[${index}].technologies must be an array`);
      }
    });
  }

  // Validate projects array
  if (!Array.isArray(data.projects)) {
    errors.push('Projects must be an array');
  } else {
    data.projects.forEach((project: any, index: number) => {
      const required = ['id', 'name', 'description', 'githubUrl'];
      required.forEach(field => {
        if (!project[field] || typeof project[field] !== 'string') {
          errors.push(`Missing or invalid projects[${index}].${field}`);
        }
      });
      if (typeof project.featured !== 'boolean') {
        errors.push(`projects[${index}].featured must be a boolean`);
      }
      if (!Array.isArray(project.techStack)) {
        errors.push(`projects[${index}].techStack must be an array`);
      }
      if (!Array.isArray(project.highlights)) {
        errors.push(`projects[${index}].highlights must be an array`);
      }
    });
  }

  // Validate achievements array
  if (!Array.isArray(data.achievements)) {
    errors.push('Achievements must be an array');
  } else {
    data.achievements.forEach((achievement: any, index: number) => {
      const required = ['id', 'title', 'organization', 'date', 'description', 'category'];
      required.forEach(field => {
        if (!achievement[field] || typeof achievement[field] !== 'string') {
          errors.push(`Missing or invalid achievements[${index}].${field}`);
        }
      });
    });
  }

  // Validate education array
  if (!Array.isArray(data.education)) {
    errors.push('Education must be an array');
  } else {
    data.education.forEach((edu: any, index: number) => {
      const required = ['id', 'institution', 'degree', 'field', 'location', 'period', 'startDate', 'endDate'];
      required.forEach(field => {
        if (!edu[field] || typeof edu[field] !== 'string') {
          errors.push(`Missing or invalid education[${index}].${field}`);
        }
      });
      if (typeof edu.current !== 'boolean') {
        errors.push(`education[${index}].current must be a boolean`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Formats portfolio data for LLM consumption
 * @param data - The portfolio data to format
 * @returns string - Formatted context string for LLM
 */
export function formatPortfolioForLLM(data: PortfolioData): string {
  const context = `
You are an AI assistant representing ${data.profile.name}, a ${data.profile.title}.

PROFILE:
- Name: ${data.profile.name}
- Title: ${data.profile.title}
- Location: ${data.profile.location}
- Email: ${data.profile.email}
- Phone: ${data.profile.phone}
- Bio: ${data.profile.bio}
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
  ${project.liveUrl ? `Live URL: ${project.liveUrl}` : ''}
  GitHub: ${project.githubUrl}
  Key Highlights:
${project.highlights.map(highlight => `  • ${highlight}`).join('\n')}
`).join('')}

SKILLS:
- Programming Languages: ${data.skills.languages.join(', ')}
- Frameworks & Libraries: ${data.skills.frameworks.join(', ')}
- DevOps & Cloud: ${data.skills.devops.join(', ')}
- Tools & Platforms: ${data.skills.tools.join(', ')}

EDUCATION:
${data.education.map(edu => `
- ${edu.degree} in ${edu.field} from ${edu.institution} (${edu.period})
  Location: ${edu.location}
  ${edu.current ? 'Currently enrolled' : 'Completed'}
`).join('')}

ACHIEVEMENTS:
${data.achievements.map(achievement => `
- ${achievement.title} (${achievement.date})
  Organization: ${achievement.organization}
  Category: ${achievement.category}
  Description: ${achievement.description}
  ${achievement.link ? `Link: ${achievement.link}` : ''}
`).join('')}

Please answer questions about this professional's background, experience, and skills based on this information. Be conversational and helpful, and provide specific details when asked about particular experiences, projects, or skills. You can discuss their work at FarAlpha and WebGuru Infosystems, their AI/ML projects like Clariq and HealerAI, their hackathon win, and their educational background.
`;

  return context.trim();
}

/**
 * Client-side data loader for browser environments
 * @returns Promise<PortfolioData> - The portfolio data
 */
export async function loadPortfolioDataClient(): Promise<PortfolioData> {
  try {
    const response = await fetch('/data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json() as PortfolioData;
    
    const validation = validatePortfolioData(data);
    if (!validation.isValid) {
      throw new Error(`Invalid portfolio data: ${validation.errors.join(', ')}`);
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load portfolio data: ${error.message}`);
    }
    throw new Error('Failed to load portfolio data: Unknown error');
  }
}