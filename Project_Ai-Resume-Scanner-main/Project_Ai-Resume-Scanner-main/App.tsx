import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Briefcase } from 'lucide-react';
import axios from 'axios';

interface Skill {
  name: string;
  confidence: number;
}

interface JobMatch {
  title: string;
  score: number;
  missingSkills: string[];
  matchedSkills: string[];
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<Skill[]>([]);
  const [jobDescription, setJobDescription] = useState('');
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }
      setFile(selectedFile);
      setError('');
      setSuccessMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccessMessage('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await axios.post('http://localhost:5000/extract-skills', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setExtractedSkills(response.data.skills);
      setActiveTab('skills');
      setSuccessMessage('Resume processed successfully!');
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.response?.data?.error || 'Failed to process resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleJobMatch = async () => {
    if (!extractedSkills.length) {
      setError('Please upload and extract skills from a resume first');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axios.post('http://localhost:5000/match-job', {
        skills: extractedSkills.map(skill => skill.name),
        jobDescription
      });
      
      setJobMatches(response.data.matches);
      setActiveTab('matches');
      setSuccessMessage('Job matching completed successfully!');
    } catch (err: any) {
      console.error('Error matching job:', err);
      setError(err.response?.data?.error || 'Failed to match job. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText size={28} />
              <h1 className="text-2xl font-bold">AI Resume Scanner</h1>
            </div>
            <div className="text-sm">
              HR Automation Tool
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'upload' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('upload')}
            >
              Upload Resume
            </button>
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'skills' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('skills')}
              disabled={!extractedSkills.length}
            >
              Extracted Skills
            </button>
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'matches' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('matches')}
              disabled={!jobMatches.length}
            >
              Job Matches
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
                <AlertCircle size={18} className="mr-2" />
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
                <CheckCircle size={18} className="mr-2" />
                {successMessage}
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="file-upload" className="cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                      Upload a file
                    </label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept=".pdf"
                    />
                    <p className="text-xs text-gray-500">PDF up to 10MB</p>
                  </div>
                  {file && (
                    <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
                      <FileText className="mr-2 h-5 w-5 text-gray-400" />
                      {file.name}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                >
                  {isUploading ? 'Processing...' : 'Extract Skills'}
                </button>

                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900">Job Description Matching</h3>
                  <div className="mt-2">
                    <textarea
                      rows={6}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Paste job description here to match with extracted skills..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleJobMatch}
                    disabled={!extractedSkills.length || !jobDescription.trim() || isUploading}
                    className="mt-3 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                  >
                    {isUploading ? 'Processing...' : 'Match with Job'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Extracted Skills</h2>
                {extractedSkills.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {extractedSkills.map((skill, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                        <div className="font-medium">{skill.name}</div>
                        <div className="text-sm text-gray-500">
                          Confidence: {Math.round(skill.confidence * 100)}%
                        </div>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-indigo-600 h-1.5 rounded-full" 
                            style={{ width: `${skill.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No skills extracted yet. Please upload a resume.</p>
                )}
              </div>
            )}

            {activeTab === 'matches' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Job Match Results</h2>
                {jobMatches.length > 0 ? (
                  <div className="space-y-6">
                    {jobMatches.map((match, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Briefcase className="text-indigo-600 mr-2" />
                            <h3 className="text-lg font-medium text-gray-900">{match.title}</h3>
                          </div>
                          <div className="text-lg font-bold text-indigo-600">
                            {Math.round(match.score * 100)}% Match
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-700 mb-2">Matched Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {match.matchedSkills.map((skill, i) => (
                              <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center">
                                <CheckCircle size={14} className="mr-1" />
                                {skill}
                              </span>
                            ))}
                            {match.matchedSkills.length === 0 && (
                              <span className="text-gray-500 text-sm">No matched skills found</span>
                            )}
                          </div>
                        </div>
                        
                        {match.missingSkills.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-700 mb-2">Missing Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {match.missingSkills.map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No job matches yet. Please match with a job description.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <FileText size={20} className="mr-2" />
                <span className="font-bold">AI Resume Scanner</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">Powered by NLP and Machine Learning</p>
            </div>
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} AI Resume Scanner. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;