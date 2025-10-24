import { PortfolioData } from '@/types/portfolio';

/**
 * Generate and download CV as PDF
 * This creates a formatted CV document from portfolio data
 */
export function downloadCV(portfolioData: PortfolioData) {
  // Create CV content as HTML for better formatting
  const cvContent = generateCVHTML(portfolioData);
  
  // Create a new window for printing/PDF generation
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download your CV');
    return;
  }

  printWindow.document.write(cvContent);
  printWindow.document.close();
  
  // Wait for content to load, then trigger print dialog
  printWindow.onload = () => {
    printWindow.print();
    // Close the window after printing (user can cancel)
    printWindow.onafterprint = () => {
      printWindow.close();
    };
  };
}

/**
 * Generate CV as downloadable text file (fallback option)
 */
export function downloadCVAsText(portfolioData: PortfolioData) {
  const cvText = generateCVText(portfolioData);
  
  const blob = new Blob([cvText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${portfolioData.profile.name.replace(/\s+/g, '_')}_CV.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

function generateCVHTML(data: PortfolioData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.profile.name} - CV</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            color: #1e40af;
            font-size: 2.5em;
        }
        .header .title {
            font-size: 1.3em;
            color: #64748b;
            margin: 10px 0;
        }
        .contact-info {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
            margin-top: 15px;
            font-size: 0.9em;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #1e40af;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .experience-item, .project-item, .education-item, .achievement-item {
            margin-bottom: 20px;
            padding: 15px;
            border-left: 3px solid #2563eb;
            background: #f8fafc;
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }
        .item-title {
            font-weight: bold;
            color: #1e40af;
        }
        .item-company {
            color: #059669;
            font-weight: 500;
        }
        .item-period {
            color: #64748b;
            font-size: 0.9em;
        }
        .highlights {
            margin: 10px 0;
        }
        .highlights li {
            margin-bottom: 5px;
        }
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        .skill-category {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 5px;
        }
        .skill-category h3 {
            margin: 0 0 10px 0;
            color: #1e40af;
        }
        .skill-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }
        .skill-tag {
            background: #2563eb;
            color: white;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 0.8em;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${data.profile.name}</h1>
        <div class="title">${data.profile.title}</div>
        <div class="contact-info">
            <span>📧 ${data.profile.email}</span>
            <span>📱 ${data.profile.phone}</span>
            <span>📍 ${data.profile.location}</span>
            <span>🔗 ${data.profile.githubUrl}</span>
            <span>💼 ${data.profile.linkedinUrl}</span>
        </div>
    </div>

    <div class="section">
        <h2>Professional Summary</h2>
        <p>${data.profile.bio}</p>
    </div>

    <div class="section">
        <h2>Experience</h2>
        ${data.experiences.map(exp => `
            <div class="experience-item">
                <div class="item-header">
                    <div>
                        <div class="item-title">${exp.role}</div>
                        <div class="item-company">${exp.company} • ${exp.location}</div>
                    </div>
                    <div class="item-period">${exp.period}</div>
                </div>
                <ul class="highlights">
                    ${exp.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                </ul>
                <div><strong>Technologies:</strong> ${exp.technologies.join(', ')}</div>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>Projects</h2>
        ${data.projects.map(project => `
            <div class="project-item">
                <div class="item-header">
                    <div>
                        <div class="item-title">${project.name}${project.featured ? ' ⭐' : ''}</div>
                        <div>${project.description}</div>
                    </div>
                </div>
                <ul class="highlights">
                    ${project.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                </ul>
                <div><strong>Tech Stack:</strong> ${project.techStack.join(', ')}</div>
                ${project.githubUrl ? `<div><strong>GitHub:</strong> ${project.githubUrl}</div>` : ''}
                ${project.liveUrl ? `<div><strong>Live URL:</strong> ${project.liveUrl}</div>` : ''}
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>Skills</h2>
        <div class="skills-grid">
            <div class="skill-category">
                <h3>Programming Languages</h3>
                <div class="skill-tags">
                    ${data.skills.languages.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
            <div class="skill-category">
                <h3>Frameworks & Libraries</h3>
                <div class="skill-tags">
                    ${data.skills.frameworks.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
            <div class="skill-category">
                <h3>DevOps & Cloud</h3>
                <div class="skill-tags">
                    ${data.skills.devops.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
            <div class="skill-category">
                <h3>Tools & Platforms</h3>
                <div class="skill-tags">
                    ${data.skills.tools.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Education</h2>
        ${data.education.map(edu => `
            <div class="education-item">
                <div class="item-header">
                    <div>
                        <div class="item-title">${edu.degree} in ${edu.field}</div>
                        <div class="item-company">${edu.institution} • ${edu.location}</div>
                    </div>
                    <div class="item-period">${edu.period}${edu.current ? ' (Current)' : ''}</div>
                </div>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>Achievements</h2>
        ${data.achievements.map(achievement => `
            <div class="achievement-item">
                <div class="item-header">
                    <div>
                        <div class="item-title">${achievement.title}</div>
                        <div class="item-company">${achievement.organization}</div>
                        <div>${achievement.description}</div>
                    </div>
                    <div class="item-period">${achievement.date}</div>
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>
  `;
}

function generateCVText(data: PortfolioData): string {
  return `
${data.profile.name}
${data.profile.title}
${data.profile.location}
${data.profile.email} | ${data.profile.phone}
${data.profile.githubUrl} | ${data.profile.linkedinUrl}

PROFESSIONAL SUMMARY
${data.profile.bio}

EXPERIENCE
${data.experiences.map(exp => `
${exp.role} | ${exp.company} | ${exp.location} | ${exp.period}
${exp.highlights.map(highlight => `• ${highlight}`).join('\n')}
Technologies: ${exp.technologies.join(', ')}
`).join('\n')}

PROJECTS
${data.projects.map(project => `
${project.name}${project.featured ? ' (Featured)' : ''}
${project.description}
${project.highlights.map(highlight => `• ${highlight}`).join('\n')}
Tech Stack: ${project.techStack.join(', ')}
${project.githubUrl ? `GitHub: ${project.githubUrl}` : ''}
${project.liveUrl ? `Live URL: ${project.liveUrl}` : ''}
`).join('\n')}

SKILLS
Programming Languages: ${data.skills.languages.join(', ')}
Frameworks & Libraries: ${data.skills.frameworks.join(', ')}
DevOps & Cloud: ${data.skills.devops.join(', ')}
Tools & Platforms: ${data.skills.tools.join(', ')}

EDUCATION
${data.education.map(edu => `
${edu.degree} in ${edu.field}
${edu.institution}, ${edu.location}
${edu.period}${edu.current ? ' (Current)' : ''}
`).join('\n')}

ACHIEVEMENTS
${data.achievements.map(achievement => `
${achievement.title} (${achievement.date})
${achievement.organization}
${achievement.description}
`).join('\n')}
  `.trim();
}