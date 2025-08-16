"use client";

import { useState } from "react";
import { sendEmail } from "../lib/mailer"; // Adjust path based on your file structure

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [instruction, setInstruction] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  // Email states
  const [recipients, setRecipients] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [subject, setSubject] = useState("Meeting Summary");
  const [sending, setSending] = useState(false);

  // Handle transcript file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setTranscript(text);
  };

  // Call API to generate summary
  const handleGenerateSummary = async () => {
    if (!transcript || !instruction) {
      alert("Please provide both transcript and instruction.");
      return;
    }

    setLoading(true);
    setSummary("");

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, instruction }),
      });

      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);
      } else {
        alert(data.error || "Failed to generate summary");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Send email using EmailJS
  const handleSendEmail = async () => {
    if (!recipients || !summary) {
      alert("Please provide recipients and a summary to send.");
      return;
    }

    if (!fromEmail || !fromName) {
      alert("Please provide your email and name.");
      return;
    }

    setSending(true);

    try {
      // Split recipients by comma and send to each one
      const emailList = recipients.split(",").map((email) => email.trim());
      const emailPromises = [];

      // Send email to each recipient
      for (const email of emailList) {
        if (email) { // Only send if email is not empty
          emailPromises.push(sendEmail({ 
            toEmail: email,
            fromEmail: fromEmail,
            name: fromName,
            title: subject,
            message: summary
          }));
        }
      }

      const results = await Promise.all(emailPromises);

      // Check if all emails were sent successfully
      const failedEmails = results.filter(result => !result.success);

      if (failedEmails.length === 0) {
        alert(`Email sent successfully to ${emailList.length} recipient(s)!`);
        setRecipients("");
      } else {
        alert(`Failed to send ${failedEmails.length} out of ${emailList.length} emails. Please try again.`);
        console.error("Failed emails:", failedEmails);
      }

    } catch (err) {
      console.error("Email sending error:", err);
      alert("Something went wrong while sending email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  AI Meeting Notes
                </h1>
                <p className="text-slate-500 text-sm">Transform conversations into actionable insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-600 font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left Column - Input */}
          <div className="space-y-6">

            {/* Transcript Input Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16l13-8L7 4z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-800">Meeting Transcript</h2>
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Upload File
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".txt,.md,.vtt,.srt"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-6 text-center transition-colors">
                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-2 text-sm text-slate-600">
                      <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-500">TXT, MD, VTT, SRT files</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Or paste transcript directly
                </label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste your meeting transcript here..."
                  rows={8}
                  className="w-full border-0 bg-slate-50/50 rounded-xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all resize-none"
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                  {transcript.length} characters
                </div>
              </div>
            </div>

            {/* Instruction Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-800">AI Instructions</h2>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="e.g., Create executive summary with action items and key decisions"
                  className="w-full border-0 bg-slate-50/50 rounded-xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all"
                />

                {/* Quick Templates */}
                <div className="flex flex-wrap gap-2">
                  {[
                    "Executive summary with action items",
                    "Key decisions and next steps",
                    "Detailed meeting minutes",
                    "Brief highlight reel"
                  ].map((template) => (
                    <button
                      key={template}
                      onClick={() => setInstruction(template)}
                      className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 rounded-full transition-colors border border-slate-200 hover:border-purple-200"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-center">
              <button
                onClick={handleGenerateSummary}
                disabled={loading || !transcript || !instruction}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Generating Summary...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>Generate Summary</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Right Column - Output */}
          <div className="space-y-6">
            {summary ? (
              <>
                {/* Summary Output Card */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-lg font-semibold text-slate-800">AI Summary</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Ready</span>
                    </div>
                  </div>

                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={10}
                    className="w-full border-0 bg-slate-50/50 rounded-xl p-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all resize-none"
                  />

                  <div className="flex justify-between items-center mt-3 text-xs text-slate-400">
                    <span>{summary.split('\n').length} lines</span>
                    <span>{summary.length} characters</span>
                  </div>
                </div>

                {/* Email Sharing Card */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800">Share via Email</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Your Name</label>
                      <input
                        type="text"
                        value={fromName}
                        onChange={(e) => setFromName(e.target.value)}
                        placeholder="Your Full Name"
                        className="w-full border-0 bg-slate-50/50 rounded-xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Your Email</label>
                      <input
                        type="email"
                        value={fromEmail}
                        onChange={(e) => setFromEmail(e.target.value)}
                        placeholder="your.email@company.com"
                        className="w-full border-0 bg-slate-50/50 rounded-xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Recipients</label>
                      <input
                        type="text"
                        value={recipients}
                        onChange={(e) => setRecipients(e.target.value)}
                        placeholder="colleague1@company.com, colleague2@company.com"
                        className="w-full border-0 bg-slate-50/50 rounded-xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Subject Line</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Meeting Summary - [Date]"
                        className="w-full border-0 bg-slate-50/50 rounded-xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                      />
                    </div>

                    <button
                      onClick={handleSendEmail}
                      disabled={sending || !recipients || !fromEmail || !fromName}
                      className="w-full group relative px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      {sending ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Sending Email...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <span>Send Summary</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Placeholder State */
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-600 mb-2">AI Summary Will Appear Here</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  Upload or paste your meeting transcript and provide instructions to generate an intelligent summary.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}