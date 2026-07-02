import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Brain, CheckCircle, ArrowRight, ArrowLeft, BarChart2 } from 'lucide-react';

const ASSESSMENTS = {
  'PHQ-9': {
    title: 'PHQ-9 Depression Assessment',
    description: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
    options: ['Not at all (0)', 'Several days (1)', 'More than half the days (2)', 'Nearly every day (3)'],
    questions: [
      'Little interest or pleasure in doing things',
      'Feeling down, depressed, or hopeless',
      'Trouble falling or staying asleep, or sleeping too much',
      'Feeling tired or having little energy',
      'Poor appetite or overeating',
      'Feeling bad about yourself — or that you are a failure',
      'Trouble concentrating on things',
      'Moving or speaking so slowly that other people could have noticed',
      'Thoughts that you would be better off dead or of hurting yourself in some way'
    ]
  },
  'GAD-7': {
    title: 'GAD-7 Anxiety Assessment',
    description: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
    options: ['Not at all (0)', 'Several days (1)', 'More than half the days (2)', 'Nearly every day (3)'],
    questions: [
      'Feeling nervous, anxious, or on edge',
      'Not being able to stop or control worrying',
      'Worrying too much about different things',
      'Trouble relaxing',
      'Being so restless that it is hard to sit still',
      'Becoming easily annoyed or irritable',
      'Feeling afraid as if something awful might happen'
    ]
  },
  'Stress': {
    title: 'Stress Assessment',
    description: 'In the last month, how often have you felt or thought the following?',
    options: ['Never (0)', 'Almost never (1)', 'Sometimes (2)', 'Fairly often (3)', 'Very often (4)'],
    questions: [
      'Been upset because of something that happened unexpectedly',
      'Felt unable to control the important things in your life',
      'Felt nervous and stressed',
      'Felt difficulties were piling up so high that you could not overcome them',
      'Been angered because of things that were outside your control',
      'Found it difficult to concentrate',
      'Felt overwhelmed by your responsibilities',
      'Had trouble sleeping because of worry',
      'Felt tension in your body (headaches, muscle tightness)',
      'Had difficulty making decisions'
    ]
  },
  'Mood': {
    title: 'Daily Mood Assessment',
    description: 'Right now, how are you feeling about each of the following?',
    options: ['Very Poor (0)', 'Poor (1)', 'Fair (2)', 'Good (3)', 'Excellent (4)'],
    questions: [
      'Overall mood and emotional state',
      'Energy levels throughout the day',
      'Social connections and relationships',
      'Motivation to complete daily tasks'
    ]
  }
};

const SEVERITY_COLORS = {
  'Minimal': 'text-green-600 bg-green-50 dark:bg-green-900/20',
  'Low': 'text-green-600 bg-green-50 dark:bg-green-900/20',
  'Good': 'text-green-600 bg-green-50 dark:bg-green-900/20',
  'Mild': 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
  'Moderate': 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  'High': 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  'Moderately Severe': 'text-red-600 bg-red-50 dark:bg-red-900/20',
  'Severe': 'text-red-700 bg-red-100 dark:bg-red-900/30',
  'Very Low': 'text-red-700 bg-red-100 dark:bg-red-900/30',
  'Low Mood': 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
};

const AssessmentPage = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const assessment = selectedType ? ASSESSMENTS[selectedType] : null;
  const progress = assessment ? Math.round(((currentQ) / assessment.questions.length) * 100) : 0;

  const startAssessment = (type) => {
    setSelectedType(type);
    setAnswers(new Array(ASSESSMENTS[type].questions.length).fill(null));
    setCurrentQ(0);
    setResult(null);
  };

  const handleAnswer = (score) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = score;
    setAnswers(newAnswers);
    if (currentQ < assessment.questions.length - 1) {
      setCurrentQ(currentQ + 1);
    }
  };

  const submitAssessment = async () => {
    if (answers.some(a => a === null)) {
      return toast.error('Please answer all questions before submitting.');
    }
    setSubmitting(true);
    try {
      const questions = assessment.questions.map((q, i) => ({
        questionText: q,
        score: answers[i]
      }));
      const res = await api.post('/assessments', { type: selectedType, questions });
      setResult(res.data);
      toast.success('Assessment submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  // Type selection screen
  if (!selectedType) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white mb-3">Mental Health Assessments</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Clinically validated self-assessment tools to help you understand your mental health. Your results are private and can be shared with your therapist.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(ASSESSMENTS).map(([type, info]) => {
            const icons = { 'PHQ-9': '😔', 'GAD-7': '😰', 'Stress': '😤', 'Mood': '😊' };
            const durations = { 'PHQ-9': '3 min', 'GAD-7': '2 min', 'Stress': '4 min', 'Mood': '1 min' };
            return (
              <button key={type} onClick={() => startAssessment(type)}
                className="text-left bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{icons[type]}</span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full">{durations[type]}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {info.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{info.description}</p>
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium text-sm">
                  Start Assessment <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link to="/assessments/history" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
            View Previous Assessment Results →
          </Link>
        </div>
      </div>
    );
  }

  // Results screen
  if (result) {
    const colorClass = SEVERITY_COLORS[result.severity] || 'text-slate-700 bg-slate-100';
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{assessment.title} — Complete</h2>
          <div className={`inline-block px-4 py-2 rounded-xl font-bold text-lg mt-4 mb-2 ${colorClass}`}>
            {result.severity}
          </div>
          <p className="text-4xl font-bold text-slate-900 dark:text-white my-4">Score: {result.score}</p>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-8 text-left">
            <p className="text-slate-700 dark:text-slate-300">{result.interpretation}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setSelectedType(null); setResult(null); }}
              className="flex-1 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
              Take Another
            </button>
            <button onClick={() => navigate('/therapists')}
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-medium">
              Find a Therapist
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Question screen
  const allAnswered = answers.every(a => a !== null);
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setSelectedType(null)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-slate-900 dark:text-white">{assessment.title}</h2>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-500 mb-2">
          <span>Question {currentQ + 1} of {assessment.questions.length}</span>
          <span>{progress}% complete</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 italic">{assessment.description}</p>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-8">
          {currentQ + 1}. {assessment.questions[currentQ]}
        </h3>
        <div className="space-y-3">
          {assessment.options.map((option, i) => (
            <button key={i} onClick={() => handleAnswer(i)}
              className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium ${
                answers[currentQ] === i
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                  : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
              }`}>
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6 gap-4">
        {currentQ > 0 && (
          <button onClick={() => setCurrentQ(q => q - 1)}
            className="flex items-center gap-2 px-5 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        <div className="flex-1" />
        {currentQ < assessment.questions.length - 1 ? (
          <button onClick={() => setCurrentQ(q => q + 1)} disabled={answers[currentQ] === null}
            className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-colors font-medium">
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={submitAssessment} disabled={!allAnswered || submitting}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-colors font-medium">
            {submitting ? 'Submitting...' : <><BarChart2 className="w-4 h-4" /> Get Results</>}
          </button>
        )}
      </div>
    </div>
  );
};

export default AssessmentPage;
