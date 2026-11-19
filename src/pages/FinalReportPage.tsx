import React, { useState } from 'react';
import {
  Download,
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FileText,
  Share2,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FinalInterviewReport } from '../types';

interface FinalReportPageProps {
  report: FinalInterviewReport;
  onRetake: () => void;
  onDashboard: () => void;
}

export const FinalReportPage: React.FC<FinalReportPageProps> = ({
  report,
  onRetake,
  onDashboard,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const isGreat = report.overallScore >= 85;
  const isGood = report.overallScore >= 70 && report.overallScore < 85;

  const downloadPdfReport = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Title & Branding Header
      doc.setFillColor(11, 19, 41); // Navy background
      doc.rect(0, 0, 210, 42, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('AI Interviewer – Performance Assessment Report', 14, 18);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(147, 197, 253);
      doc.text(`Candidate Track: ${report.jobRole} (${report.interviewType})`, 14, 27);
      doc.text(`Date: ${new Date(report.createdAt).toLocaleDateString()} | Duration: ${Math.floor(report.durationSeconds / 60)}m ${report.durationSeconds % 60}s`, 14, 34);

      // Score Box in Header
      doc.setFillColor(37, 99, 235);
      doc.roundedRect(155, 10, 42, 24, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text('OVERALL SCORE', 160, 17);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`${report.overallScore} / 100`, 160, 28);

      let currentY = 52;

      // Executive Summary
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Executive Evaluation Summary', 14, currentY);
      currentY += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const splitSummary = doc.splitTextToSize(report.summary || 'Solid candidate performance demonstrated across core disciplines.', 180);
      doc.text(splitSummary, 14, currentY);
      currentY += splitSummary.length * 5 + 6;

      // Technical & Communication Sections
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('2. Technical Competency & Communication', 14, currentY);
      currentY += 6;

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const splitTech = doc.splitTextToSize(`Technical Assessment: ${report.technicalKnowledgeAssessment}`, 180);
      doc.text(splitTech, 14, currentY);
      currentY += splitTech.length * 4.8 + 4;

      const splitComm = doc.splitTextToSize(`Communication Feedback: ${report.communicationFeedback}`, 180);
      doc.text(splitComm, 14, currentY);
      currentY += splitComm.length * 4.8 + 8;

      // Question Breakdown Table
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('3. Individual Question Scores & Analysis', 14, currentY);
      currentY += 4;

      const tableRows = report.answers.map((ans, idx) => [
        `#${idx + 1}`,
        ans.questionText.slice(0, 65) + (ans.questionText.length > 65 ? '...' : ''),
        ans.evaluation ? `${ans.evaluation.score} / 10` : '7.5 / 10',
        ans.evaluation ? ans.evaluation.positiveFeedback.slice(0, 75) + '...' : 'Recorded',
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Q#', 'Question Asked', 'Score', 'AI Feedback Note']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [29, 78, 216], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
        columnStyles: {
          0: { cellWidth: 12 },
          1: { cellWidth: 80 },
          2: { cellWidth: 22 },
          3: { cellWidth: 68 },
        },
      });

      // Save the PDF file
      doc.save(`AI_Interview_Report_${report.jobRole.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Could not export PDF. Please verify browser print settings.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-brand-950 to-navy-900 border border-brand-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Interview Session Completed Successfully</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Final Interview Performance Report
          </h1>

          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Role: <span className="text-white font-semibold">{report.jobRole}</span> • Track: <span className="text-brand-300 font-semibold">{report.interviewType}</span> • Experience: <span className="text-slate-200">{report.experienceLevel}</span>
          </p>

          <p className="text-xs text-slate-400 flex items-center justify-center md:justify-start space-x-4 pt-1">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{new Date(report.createdAt).toLocaleDateString()}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{Math.floor(report.durationSeconds / 60)}m {report.durationSeconds % 60}s</span>
            </span>
          </p>
        </div>

        {/* Big Overall Score Circle */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl ${
            isGreat
              ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300'
              : isGood
              ? 'border-brand-400 bg-brand-950/40 text-brand-300'
              : 'border-amber-400 bg-amber-950/40 text-amber-300'
          }`}>
            <span className="text-4xl font-extrabold text-white">{report.overallScore}</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">out of 100</span>
          </div>
          <span className={`mt-2 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
            isGreat
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : isGood
              ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}>
            {isGreat ? 'Exceptional Readiness' : isGood ? 'Strong Performance' : 'Developing Potential'}
          </span>
        </div>
      </div>

      {/* Action Bar (Download PDF & Navigation) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-navy-900/80 border border-navy-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={downloadPdfReport}
            disabled={isGeneratingPdf}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/20 transition flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Official PDF Report'}</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRetake}
            className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs sm:text-sm font-semibold transition"
          >
            Practice Another Track
          </button>
          <button
            onClick={onDashboard}
            className="px-4 py-2.5 rounded-xl bg-navy-850 hover:bg-navy-800 text-white border border-navy-700 text-xs sm:text-sm font-semibold transition flex items-center space-x-1.5"
          >
            <span>Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-6 rounded-2xl bg-navy-900/80 border border-emerald-500/20 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Key Demonstrated Strengths</h3>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
            {report.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start space-x-2 bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/20">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses / Opportunities */}
        <div className="p-6 rounded-2xl bg-navy-900/80 border border-amber-500/20 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Areas for Growth</h3>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
            {report.weaknesses.map((w, idx) => (
              <li key={idx} className="flex items-start space-x-2 bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/20">
                <span className="text-amber-400 font-bold">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Narrative Assessments: Technical Knowledge & Communication */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl space-y-2">
          <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Technical Knowledge Assessment</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {report.technicalKnowledgeAssessment}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl space-y-2">
          <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Communication & Articulation Feedback</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {report.communicationFeedback}
          </p>
        </div>
      </div>

      {/* Recommended Topics to Study */}
      {report.recommendedTopics && report.recommendedTopics.length > 0 && (
        <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-brand-400" />
            <span>Curated Topics to Study Next</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {report.recommendedTopics.map((topic, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Individual Question-by-Question Breakdown */}
      <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Question-by-Question Diagnostic</h3>
            <p className="text-xs text-slate-400">Detailed answers and individual score breakdown</p>
          </div>
        </div>

        <div className="space-y-3">
          {report.answers.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            const score = item.evaluation?.score ?? 7.5;
            return (
              <div
                key={idx}
                className="rounded-xl border border-navy-800 bg-navy-950 overflow-hidden transition"
              >
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-navy-900/60 transition"
                >
                  <div className="flex items-center space-x-3 pr-4">
                    <span className="w-6 h-6 rounded-full bg-navy-800 text-slate-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-white text-xs sm:text-sm line-clamp-1">
                      {item.questionText}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className="px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 font-bold text-xs border border-brand-500/20">
                      {score} / 10
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 border-t border-navy-850 bg-navy-900/40 space-y-3 text-xs sm:text-sm">
                    <div>
                      <p className="font-semibold text-slate-400 text-xs mb-1">Your Submitted Response:</p>
                      <p className="p-3 rounded-xl bg-navy-950 border border-navy-800 text-slate-200 italic leading-relaxed">
                        "{item.answerText || 'No answer recorded.'}"
                      </p>
                    </div>

                    {item.evaluation && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                          <p className="font-bold text-emerald-400 text-xs mb-0.5">Strengths:</p>
                          <p className="text-xs text-slate-300">{item.evaluation.positiveFeedback}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">
                          <p className="font-bold text-amber-400 text-xs mb-0.5">Improvements:</p>
                          <p className="text-xs text-slate-300">{item.evaluation.areasForImprovement}</p>
                        </div>
                      </div>
                    )}

                    {item.evaluation?.suggestedBetterAnswer && (
                      <div className="p-3 rounded-xl bg-navy-950 border border-navy-800">
                        <p className="font-bold text-cyan-400 text-xs mb-0.5">Model Exemplary Answer:</p>
                        <p className="text-xs text-slate-300 italic">{item.evaluation.suggestedBetterAnswer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

