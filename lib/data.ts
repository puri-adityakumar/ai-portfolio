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

  // Validate personal info
  if (!data.personal) {
    errors.push('Missing personal information');
  } else {
    const required = ['name', 'title', 'email', 'phone', 'location', 'summary', 'photo'];
    required.forEach(field => {
      if (!data.personal[field] || typeof data.personal[field] !== 'string') {
        errors.push(`Missing or invalid personal.${field}`);
      }
    });
  }

  // Validate experience array
  if (!Array.isArray(data.experience)) {
    errors.push('Experience must be an array');
  } else {
    data.experience.forEach((exp: any, index: number) => {
      const required = ['company', 'position', 'duration', 'description'];
      required.forEach(field => {
        if (!exp[field] || typeof exp[field] !== 'string') {
          errors.push(`Missing or invalid experience[${index}].${field}`);
        }
      });
      if (!Array.isArray(exp.technologies)) {
        errors.push(`experience[${index}].technologies must be an array`);
      }
    });
  }

  // Validate projects array
  if (!Array.isArray(data.projects)) {
    errors.push('Projects must be an array');
  } else {
    data.projects.forEach((project: any, index: number) => {
      const required = ['name', 'description', 'link', 'github'];
      required.forEach(field => {
        if (!project[field] || typeof project[field] !== 'string') {
          errors.push(`Missing or invalid projects[${index}].${field}`);
        }
      });
      if (!Array.isArray(project.technologies)) {
        errors.push(`projects[${index}].technologies must be an array`);
      }
    });
  }

  // Validate skills array
  if (!Array.isArray(data.skills)) {
    errors.push('Skills must be an array');
  } else {
    data.skills.forEach((skill: any, index: number) => {
      if (!skill.category || typeof skill.category !== 'string') {
        errors.push(`Missing or invalid skills[${index}].category`);
      }
      if (!Array.isArray(skill.items)) {
        errors.push(`skills[${index}].items must be an array`);
      }
    });
  }

  // Validate education array
  if (!Array.isArray(data.education)) {
    errors.push('Education must be an array');
  } else {
    data.education.forEach((edu: any, index: number) => {
      const required = ['institution', 'degree', 'field', 'duration'];
      required.forEach(field => {
        if (!edu[field] || typeof edu[field] !== 'string') {
          errors.push(`Missing or invalid education[${index}].${field}`);
        }
      });
    });
  }

  // Validate achievements array
  if (!Array.isArray(data.achievements)) {
    errors.push('Achievements must be an array');
  } else {
    data.achievements.forEach((achievement: any, index: number) => {
      if (typeof achievement !== 'string') {
        errors.push(`achievements[${index}] must be a string`);
      }
    });
  }

  // Validate social array
  if (!Array.isArray(data.social)) {
    errors.push('Social must be an array');
  } else {
    data.social.forEach((social: any, index: number) => {
      const required = ['platform', 'url'];
      required.forEach(field => {
        if (!social[field] || typeof social[field] !== 'string') {
          errors.push(`Missing or invalid social[${index}].${field}`);
        }
      });
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
You are an AI assistant representing ${data.personal.name}, a ${data.personal.title}.

PERSONAL INFO:
- Name: ${data.personal.name}
- Title: ${data.personal.title}
- Location: ${data.personal.location}
- Email: ${data.personal.email}
- Phone: ${data.personal.phone}
- Summary: ${data.personal.summary}

EXPERIENCE:
${data.experience.map(exp => `
- ${exp.position} at ${exp.company} (${exp.duration})
  ${exp.description}
  Technologies: ${exp.technologies.join(', ')}
`).join('')}

PROJECTS:
${data.projects.map(project => `
- ${project.name}
  ${project.description}
  Technologies: ${project.technologies.join(', ')}
  Link: ${project.link}
  GitHub: ${project.github}
`).join('')}

SKILLS:
${data.skills.map(skillCategory => `
${skillCategory.category}: ${skillCategory.items.join(', ')}
`).join('')}

EDUCATION:
${data.education.map(edu => `
- ${edu.degree} in ${edu.field} from ${edu.institution} (${edu.duration})${edu.gpa ? ` - GPA: ${edu.gpa}` : ''}
`).join('')}

ACHIEVEMENTS:
${data.achievements.map(achievement => `- ${achievement}`).join('\n')}

SOCIAL LINKS:
${data.social.map(social => `- ${social.platform}: ${social.url}`).join('\n')}

Please answer questions about this professional's background, experience, and skills based on this information. Be conversational and helpful, and provide specific details when asked about particular experiences, projects, or skills.
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