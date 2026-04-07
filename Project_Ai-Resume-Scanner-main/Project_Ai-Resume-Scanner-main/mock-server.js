import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = `${__dirname}/uploads`;
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Define common skills for mock data
const COMMON_SKILLS = [
  "Python", "Java", "JavaScript", "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin", "Go",
  "React", "Angular", "Vue.js", "Node.js", "Express", "Django", "Flask", "Spring", "ASP.NET",
  "HTML", "CSS", "SQL", "NoSQL", "MongoDB", "PostgreSQL", "MySQL", "Oracle", "Redis",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Jenkins", "Git", "GitHub", "GitLab",
  "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Data Science", "AI",
  "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "R", "Tableau", "Power BI",
  "Agile", "Scrum", "Kanban", "DevOps", "CI/CD", "Test Driven Development", "RESTful API",
  "GraphQL", "Microservices", "Serverless", "Linux", "Windows", "MacOS", "iOS", "Android"
];

// Define common job titles and their required skills
const COMMON_JOBS = [
  {
    "title": "Frontend Developer",
    "required_skills": ["JavaScript", "HTML", "CSS", "React", "Angular", "Vue.js", "Git"]
  },
  {
    "title": "Backend Developer",
    "required_skills": ["Python", "Java", "Node.js", "SQL", "NoSQL", "RESTful API", "Git"]
  },
  {
    "title": "Full Stack Developer",
    "required_skills": ["JavaScript", "HTML", "CSS", "React", "Node.js", "SQL", "Git"]
  },
  {
    "title": "Data Scientist",
    "required_skills": ["Python", "R", "Machine Learning", "Deep Learning", "Pandas", "NumPy", "SQL"]
  },
  {
    "title": "DevOps Engineer",
    "required_skills": ["Linux", "Docker", "Kubernetes", "AWS", "CI/CD", "Git", "Jenkins"]
  }
];

// Extract skills endpoint
app.post('/extract-skills', upload.single('resume'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate random skills (in a real app, this would analyze the PDF)
    const numberOfSkills = Math.floor(Math.random() * 15) + 10; // 10-25 skills
    const shuffledSkills = [...COMMON_SKILLS].sort(() => 0.5 - Math.random());
    const selectedSkills = shuffledSkills.slice(0, numberOfSkills);
    
    const skills = selectedSkills.map(skill => ({
      name: skill,
      confidence: Math.random() * 0.3 + 0.7 // Random confidence between 0.7 and 1.0
    }));

    // Sort by confidence
    skills.sort((a, b) => b.confidence - a.confidence);
    
    return res.status(200).json({ skills });
  } catch (error) {
    console.error('Error processing file:', error);
    return res.status(500).json({ error: error.message || 'Failed to process resume' });
  }
});

// Match job endpoint
app.post('/match-job', (req, res) => {
  try {
    const { skills, jobDescription } = req.body;
    
    if (!skills || !jobDescription) {
      return res.status(400).json({ error: 'Missing skills or job description' });
    }

    const jobDescriptionLower = jobDescription.toLowerCase();
    const matches = [];
    
    // Match against predefined jobs
    for (const job of COMMON_JOBS) {
      if (jobDescriptionLower.includes(job.title.toLowerCase())) {
        const skillNames = skills.map(skill => typeof skill === 'string' ? skill.toLowerCase() : skill.name.toLowerCase());
        const requiredSkills = job.required_skills.map(skill => skill.toLowerCase());
        
        // Find matched and missing skills
        const matchedSkills = job.required_skills.filter(skill => 
          skillNames.includes(skill.toLowerCase())
        );
        
        const missingSkills = job.required_skills.filter(skill => 
          !skillNames.includes(skill.toLowerCase())
        );
        
        // Calculate match score
        const matchScore = requiredSkills.length > 0 
          ? matchedSkills.length / requiredSkills.length 
          : 0;
        
        matches.push({
          title: job.title,
          score: matchScore,
          matchedSkills,
          missingSkills
        });
      }
    }
    
    // If no predefined jobs match, do a generic skill matching
    if (matches.length === 0) {
      // Extract skills from job description
      const jobSkills = COMMON_SKILLS.filter(skill => 
        jobDescriptionLower.includes(skill.toLowerCase())
      );
      
      const skillNames = skills.map(skill => typeof skill === 'string' ? skill.toLowerCase() : skill.name.toLowerCase());
      const requiredSkills = jobSkills.map(skill => skill.toLowerCase());
      
      // Find matched and missing skills
      const matchedSkills = jobSkills.filter(skill => 
        skillNames.includes(skill.toLowerCase())
      );
      
      const missingSkills = jobSkills.filter(skill => 
        !skillNames.includes(skill.toLowerCase())
      );
      
      // Calculate match score
      const matchScore = requiredSkills.length > 0 
        ? matchedSkills.length / requiredSkills.length 
        : 0;
      
      matches.push({
        title: "Custom Job Position",
        score: matchScore,
        matchedSkills,
        missingSkills
      });
    }
    
    // Sort by match score
    matches.sort((a, b) => b.score - a.score);
    
    return res.status(200).json({ matches });
  } catch (error) {
    console.error('Error matching job:', error);
    return res.status(500).json({ error: error.message || 'Failed to match job' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
});