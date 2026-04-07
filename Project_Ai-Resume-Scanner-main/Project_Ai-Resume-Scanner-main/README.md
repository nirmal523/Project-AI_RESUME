# AI-Based Resume Scanner

An application that uses Natural Language Processing (NLP) to extract key skills from resumes and match them with job descriptions.

## Features

- Upload resume in PDF format
- Extract key skills using NLP
- Match with job descriptions
- View match scores and missing skills

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Data Processing**: JavaScript

## Getting Started

### Prerequisites

- Node.js

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   npm run server
   ```
2. In a separate terminal, start the frontend development server:
   ```
   npm run dev
   ```
3. Open your browser and navigate to the URL shown in the terminal

## How It Works

1. **Resume Upload**: Users upload their resume in PDF format
2. **Skill Extraction**: The backend extracts text from the PDF and uses algorithms to identify skills
3. **Job Matching**: Users can enter job descriptions to match against their extracted skills
4. **Results**: The application displays match scores, matched skills, and missing skills

## Real-World Use Cases

- HR departments for initial candidate screening
- Job seekers to optimize their resumes for specific positions
- Recruitment agencies for candidate-job matching
- Career counselors for skill gap analysis