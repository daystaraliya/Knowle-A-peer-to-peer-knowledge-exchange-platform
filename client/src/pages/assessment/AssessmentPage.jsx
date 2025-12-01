import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { startAssessment, submitAssessment } from '../../api/assessmentApi';
import Button from '../../components/Button';

const AssessmentPage = () => {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const [topicName, setTopicName] = useState('');
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    useEffect(() => {
        const fetchAssessment = async () => {
            try {
                const response = await startAssessment(topicId);
                setQuestions(response.data.questions);
                setTopicName(response.data.topicName);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to start assessment.');
            } finally {
                setLoading(false);
            }
        };
        fetchAssessment();
    }, [topicId]);

    const handleAnswerSelect = (questionId, option) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }));
        // Automatically move to the next question
        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            }
        }, 300); // Short delay for UX
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length !== questions.length) {
            setError("Please answer all questions before submitting.");
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const response = await submitAssessment(topicId, { questions, answers });
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit assessment.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="text-center p-10">
            <h2 className="text-2xl font-semibold">Generating your assessment...</h2>
            <p className="text-textSecondary">The AI is preparing questions to test your knowledge.</p>
        </div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">{error}</div>;
    }
    
    if (result) {
        return (
            <div className="text-center max-w-lg mx-auto bg-surface p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-primary">Assessment Complete!</h1>
                <p className="mt-2 text-textSecondary">Based on your answers, the AI has assessed your proficiency in <span className="font-semibold">{topicName}</span> as:</p>
                <div className="my-6">
                    <span className="text-4xl font-extrabold text-secondary">{result.proficiency}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                    <p className="font-semibold">AI Justification:</p>
                    <p className="text-textSecondary italic">"{result.justification}"</p>
                </div>
                <Button onClick={() => navigate('/profile')} className="mt-8">Return to Profile</Button>
            </div>
        );
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="max-w-2xl mx-auto bg-surface p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-center mb-2">Skill Assessment: {topicName}</h1>
            <p className="text-textSecondary text-center mb-6">Question {currentQuestionIndex + 1} of {questions.length}</p>

            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progressPercentage}%`, transition: 'width 0.3s' }}></div>
            </div>

            {currentQuestion && (
                <div>
                    <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>
                    <div className="space-y-4">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                                className={`block w-full text-left p-4 rounded-lg border-2 transition-colors ${answers[currentQuestion.id] === option ? 'bg-primary border-primary text-white font-semibold' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {currentQuestionIndex === questions.length - 1 && (
                <div className="text-center mt-8">
                    <Button onClick={handleSubmit} disabled={submitting || Object.keys(answers).length !== questions.length}>
                        {submitting ? 'Evaluating...' : 'Submit & See Results'}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AssessmentPage;