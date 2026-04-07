from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import PyPDF2
import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import pandas as pd
import random  # For demo purposes

# Create server directory if it doesn't exist
os.makedirs('server', exist_ok=True)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Download NLTK resources
nltk.download('punkt')
nltk.download('stopwords')

# Define a list of common technical skills for NLP matching
COMMON_SKILLS = [
    "Python", "Java", "JavaScript", "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin", "Go",
    "React", "Angular", "Vue.js", "Node.js", "Express", "Django", "Flask", "Spring", "ASP.NET",
    "HTML", "CSS", "SQL", "NoSQL", "MongoDB", "PostgreSQL", "MySQL", "Oracle", "Redis",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Jenkins", "Git", "GitHub", "GitLab",
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Data Science", "AI",
    "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "R", "Tableau", "Power BI",
    "Agile", "Scrum", "Kanban", "DevOps", "CI/CD", "Test Driven Development", "RESTful API",
    "GraphQL", "Microservices", "Serverless", "Linux", "Windows", "MacOS", "iOS", "Android"
]

# Define common job titles and their required skills
COMMON_JOBS = [
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
]

def extract_text_from_pdf(pdf_file):
    """Extract text from a PDF file."""
    reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

def extract_skills(text):
    """Extract skills from text using NLP techniques."""
    # Tokenize text
    tokens = word_tokenize(text.lower())
    
    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    filtered_tokens = [w for w in tokens if w.isalnum() and w not in stop_words]
    
    # Extract skills by matching with common skills list
    skills = []
    for skill in COMMON_SKILLS:
        skill_lower = skill.lower()
        # Check for exact matches or as part of a compound word
        if skill_lower in text.lower() or any(skill_lower in token for token in filtered_tokens):
            # Add skill with a confidence score (simulated for demo)
            confidence = random.uniform(0.7, 1.0)
            skills.append({"name": skill, "confidence": confidence})
    
    # Sort by confidence
    skills.sort(key=lambda x: x["confidence"], reverse=True)
    return skills

def match_job_description(skills, job_description):
    """Match extracted skills with job description."""
    job_description_lower = job_description.lower()
    
    # Extract potential job titles from the description
    matches = []
    
    # For demo purposes, we'll match against predefined jobs
    # In a real app, you would use more sophisticated NLP techniques
    for job in COMMON_JOBS:
        # Check if job title is in the description
        if job["title"].lower() in job_description_lower:
            skill_names = [skill.lower() for skill in skills]
            required_skills = [skill.lower() for skill in job["required_skills"]]
            
            # Find matched and missing skills
            matched_skills = [skill for skill in job["required_skills"] 
                             if skill.lower() in skill_names]
            missing_skills = [skill for skill in job["required_skills"] 
                             if skill.lower() not in skill_names]
            
            # Calculate match score
            if len(required_skills) > 0:
                match_score = len(matched_skills) / len(required_skills)
            else:
                match_score = 0
                
            matches.append({
                "title": job["title"],
                "score": match_score,
                "matchedSkills": matched_skills,
                "missingSkills": missing_skills
            })
    
    # If no predefined jobs match, do a generic skill matching
    if not matches:
        # Extract skills from job description
        job_skills = []
        for skill in COMMON_SKILLS:
            if skill.lower() in job_description_lower:
                job_skills.append(skill)
        
        skill_names = [skill.lower() for skill in skills]
        required_skills = [skill.lower() for skill in job_skills]
        
        # Find matched and missing skills
        matched_skills = [skill for skill in job_skills 
                         if skill.lower() in skill_names]
        missing_skills = [skill for skill in job_skills 
                         if skill.lower() not in skill_names]
        
        # Calculate match score
        if len(required_skills) > 0:
            match_score = len(matched_skills) / len(required_skills)
        else:
            match_score = 0
            
        matches.append({
            "title": "Custom Job Position",
            "score": match_score,
            "matchedSkills": matched_skills,
            "missingSkills": missing_skills
        })
    
    # Sort by match score
    matches.sort(key=lambda x: x["score"], reverse=True)
    return matches

@app.route('/extract-skills', methods=['POST'])
def extract_skills_endpoint():
    """Endpoint to extract skills from a resume."""
    if 'resume' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['resume']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and file.filename.endswith('.pdf'):
        try:
            # Extract text from PDF
            text = extract_text_from_pdf(file)
            
            # Extract skills from text
            skills = extract_skills(text)
            
            return jsonify({"skills": skills}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "File must be a PDF"}), 400

@app.route('/match-job', methods=['POST'])
def match_job_endpoint():
    """Endpoint to match skills with a job description."""
    data = request.json
    
    if not data or 'skills' not in data or 'jobDescription' not in data:
        return jsonify({"error": "Missing skills or job description"}), 400
    
    skills = data['skills']
    job_description = data['jobDescription']
    
    try:
        # Match skills with job description
        matches = match_job_description(skills, job_description)
        
        return jsonify({"matches": matches}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)