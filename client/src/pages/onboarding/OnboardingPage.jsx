import React, { useState, useEffect, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getOnboardingQuestions, getAiSuggestions, completeOnboarding } from '../../api/onboardingApi';
import OnboardingStep from '../../components/onboarding/OnboardingStep';
import SuggestedTopics from '../../components/onboarding/SuggestedTopics';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const OnboardingPage = () => {
    const { user, refetchUser, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [suggestions, setSuggestions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && user?.onboardingCompleted) {
            navigate('/dashboard');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await getOnboardingQuestions();
                setQuestions(response.data);
            } catch (error) {
                toast.error("Could not load onboarding steps.");
            } finally {
                setLoading(false);
            }
        };
        if (!user?.onboardingCompleted) {
            fetchQuestions();
        }
    }, [user]);

    const handleAnswer = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleNext = async () => {
        if (currentStep < questions.length) {
            setCurrentStep(prev => prev + 1);
        }
        
        // If it's the last question, fetch suggestions
        if (currentStep === questions.length - 1) {
            setSubmitting(true);
            try {
                const response = await getAiSuggestions({ answers });
                setSuggestions(response.data);
            } catch (error) {
                toast.error("Could not get AI suggestions. Please try again.");
                setCurrentStep(prev => prev - 1); // Go back if it fails
            } finally {
                setSubmitting(false);
            }
        }
    };

    const handleFinish = async (selections) => {
        setSubmitting(true);
        try {
            await completeOnboarding(selections);
            await refetchUser(); // Crucial to update the user context
            toast.success("Welcome to Knowle! Your profile is all set up.");
            navigate('/dashboard');
        } catch (error) {
            toast.error("Failed to save your profile. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };
    
    if (authLoading || loading) {
        return <div className="text-center">Loading...</div>;
    }
    
    if (!user || user.onboardingCompleted) {
        return <Navigate to="/dashboard" replace />;
    }

    const totalSteps = questions.length + (suggestions ? 1 : 0);
    const progressPercentage = (currentStep / totalSteps) * 100;

    return (
        <div className="max-w-3xl mx-auto bg-surface p-8 rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold text-center mb-2">Welcome to Knowle, {user.fullName.split(' ')[0]}!</h1>
            <p className="text-textSecondary text-center mb-6">Let's set up your profile so you can start learning and sharing.</p>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progressPercentage}%`, transition: 'width 0.5s' }}></div>
            </div>

            {currentStep < questions.length ? (
                <div>
                    <OnboardingStep
                        question={questions[currentStep]}
                        onAnswer={handleAnswer}
                        currentAnswer={answers[questions[currentStep].id]}
                    />
                    <div className="text-right mt-8">
                        <Button onClick={handleNext} disabled={!answers[questions[currentStep].id]}>
                            Next
                        </Button>
                    </div>
                </div>
            ) : submitting ? (
                 <div className="text-center p-10">
                    <h2 className="text-2xl font-semibold animate-pulse">Analyzing your interests...</h2>
                    <p className="text-textSecondary">Our AI is crafting the perfect skill suggestions for you.</p>
                </div>
            ) : suggestions ? (
                <SuggestedTopics suggestions={suggestions} onFinish={handleFinish} />
            ) : null}
        </div>
    );
};

export default OnboardingPage;
