/*
  # Insert Sample Data for Testing

  1. Sample Data
    - Sample resume data for testing
    - Sample assessment results
    - Sample reports

  Note: This assumes a test user exists with the email admin@myresumepath.com
*/

-- Insert sample resume data (will be linked to admin user after account creation)
DO $$
DECLARE
  admin_user_id uuid;
  sample_resume_id uuid;
  sample_assessment_id uuid;
BEGIN
  -- Get admin user ID (this will work after the admin account is created)
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@myresumepath.com' 
  LIMIT 1;

  -- Only insert sample data if admin user exists
  IF admin_user_id IS NOT NULL THEN
    -- Insert sample resume
    INSERT INTO resumes (id, user_id, filename, content, parsed_data, created_at)
    VALUES (
      gen_random_uuid(),
      admin_user_id,
      'John_Doe_Resume.pdf',
      'John Doe
Senior Software Engineer
Email: john.doe@email.com
Phone: (555) 123-4567
Location: San Francisco, CA

PROFESSIONAL SUMMARY
Experienced software engineer with 8+ years of expertise in full-stack development, cloud architecture, and team leadership. Proven track record of delivering scalable solutions and mentoring development teams.

TECHNICAL SKILLS
Programming Languages: JavaScript, TypeScript, Python, Java, Go
Frontend: React, Vue.js, Angular, HTML5, CSS3, Tailwind CSS
Backend: Node.js, Express, Django, Spring Boot, FastAPI
Databases: PostgreSQL, MongoDB, Redis, MySQL
Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD, Terraform
Tools: Git, JIRA, Slack, VS Code, IntelliJ

PROFESSIONAL EXPERIENCE

Senior Software Engineer | TechCorp Inc. | 2022 - Present
• Led development of microservices architecture serving 2M+ users
• Implemented CI/CD pipelines reducing deployment time by 60%
• Mentored 5 junior developers and conducted code reviews
• Designed and built real-time analytics dashboard using React and WebSockets

Software Engineer | StartupXYZ | 2020 - 2022
• Built responsive web applications using React and Node.js
• Collaborated with design team to implement user-friendly interfaces
• Optimized database queries improving application performance by 40%
• Participated in agile development process and sprint planning

Junior Developer | DevCorp | 2018 - 2020
• Developed REST APIs using Express.js and MongoDB
• Created automated testing suites with Jest and Cypress
• Contributed to open-source projects and internal tools

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2018
GPA: 3.8/4.0

CERTIFICATIONS
• AWS Certified Solutions Architect - Professional (2023)
• Google Cloud Professional Developer (2022)
• Certified Kubernetes Administrator (2021)',
      '{
        "personalInfo": {
          "name": "John Doe",
          "email": "john.doe@email.com",
          "phone": "(555) 123-4567",
          "location": "San Francisco, CA"
        },
        "summary": "Experienced software engineer with 8+ years of expertise in full-stack development, cloud architecture, and team leadership. Proven track record of delivering scalable solutions and mentoring development teams.",
        "experience": [
          {
            "title": "Senior Software Engineer",
            "company": "TechCorp Inc.",
            "duration": "2022 - Present",
            "description": "Led development of microservices architecture serving 2M+ users. Implemented CI/CD pipelines reducing deployment time by 60%. Mentored 5 junior developers and conducted code reviews."
          },
          {
            "title": "Software Engineer",
            "company": "StartupXYZ",
            "duration": "2020 - 2022",
            "description": "Built responsive web applications using React and Node.js. Collaborated with design team to implement user-friendly interfaces. Optimized database queries improving application performance by 40%."
          },
          {
            "title": "Junior Developer",
            "company": "DevCorp",
            "duration": "2018 - 2020",
            "description": "Developed REST APIs using Express.js and MongoDB. Created automated testing suites with Jest and Cypress. Contributed to open-source projects and internal tools."
          }
        ],
        "education": [
          {
            "degree": "Bachelor of Science in Computer Science",
            "institution": "University of Technology",
            "year": "2018",
            "gpa": "3.8/4.0"
          }
        ],
        "skills": [
          "JavaScript", "TypeScript", "Python", "Java", "Go", "React", "Vue.js", 
          "Angular", "Node.js", "Express", "Django", "PostgreSQL", "MongoDB", 
          "AWS", "Docker", "Kubernetes", "CI/CD", "Git"
        ],
        "certifications": [
          "AWS Certified Solutions Architect - Professional",
          "Google Cloud Professional Developer",
          "Certified Kubernetes Administrator"
        ]
      }',
      '2024-01-15 10:30:00'
    ) RETURNING id INTO sample_resume_id;

    -- Insert sample assessment
    INSERT INTO assessments (id, user_id, assessment_type, responses, results, created_at)
    VALUES (
      gen_random_uuid(),
      admin_user_id,
      'personality',
      '{
        "work_environment": "Collaborative team environment",
        "career_motivation": "Learning and personal growth",
        "technical_interest": 5,
        "leadership_interest": 4,
        "risk_tolerance": 3,
        "ideal_role": "I want to lead technical teams while staying hands-on with architecture and mentoring. I enjoy solving complex problems and building scalable systems."
      }',
      '{
        "careerType": "Investigative & Enterprising",
        "workStyle": "Structured environment with innovation opportunities",
        "strengths": ["Technical problem-solving", "Strategic thinking", "Continuous learning", "Team leadership"],
        "idealEnvironment": "Collaborative teams with autonomy and growth opportunities",
        "leadership_potential": 85,
        "creativity_score": 78,
        "analytical_thinking": 92,
        "communication_skills": 80
      }',
      '2024-01-15 11:00:00'
    ) RETURNING id INTO sample_assessment_id;

    -- Insert sample report
    INSERT INTO reports (id, user_id, resume_id, assessment_id, report_data, created_at)
    VALUES (
      gen_random_uuid(),
      admin_user_id,
      sample_resume_id,
      sample_assessment_id,
      '{
        "resumeAnalysis": {
          "skills": ["JavaScript", "TypeScript", "Python", "React", "Node.js", "AWS", "Docker"],
          "experience": "8+ years",
          "education": "Bachelor of Computer Science",
          "certifications": 3,
          "strengthAreas": ["Full-stack development", "Cloud architecture", "Team leadership"]
        },
        "skillGaps": [
          {"skill": "Machine Learning", "gap": 3, "priority": "high"},
          {"skill": "Data Science", "gap": 2, "priority": "medium"},
          {"skill": "Blockchain", "gap": 4, "priority": "low"}
        ],
        "careerMatches": [
          {"role": "Senior Software Architect", "match": 94, "salary": "$150,000 - $220,000"},
          {"role": "Technical Lead", "match": 91, "salary": "$130,000 - $180,000"},
          {"role": "Engineering Manager", "match": 88, "salary": "$140,000 - $200,000"},
          {"role": "Solutions Architect", "match": 86, "salary": "$135,000 - $190,000"}
        ],
        "courseRecommendations": [
          {
            "title": "Machine Learning Engineering",
            "provider": "Coursera",
            "duration": "4 months",
            "price": "$49/month",
            "skills": ["Machine Learning", "Python", "TensorFlow"]
          },
          {
            "title": "AWS Solutions Architect Professional",
            "provider": "AWS Training",
            "duration": "40 hours",
            "price": "$300",
            "skills": ["Cloud Architecture", "AWS Services", "System Design"]
          }
        ],
        "personalityInsights": {
          "type": "Investigative & Enterprising",
          "strengths": ["Technical problem-solving", "Strategic thinking", "Team leadership"],
          "workStyle": "Collaborative environment with autonomy",
          "careerGrowth": "High potential for senior technical leadership roles"
        },
        "nextSteps": [
          "Consider pursuing machine learning specialization",
          "Explore technical leadership opportunities",
          "Build expertise in emerging technologies",
          "Develop data science skills for competitive advantage"
        ],
        "generatedAt": "2024-01-15T12:00:00Z"
      }',
      '2024-01-15 12:00:00'
    );
  END IF;
END $$;