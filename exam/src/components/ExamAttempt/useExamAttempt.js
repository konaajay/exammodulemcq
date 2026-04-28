import { useState, useEffect, useCallback, useRef } from 'react';
import { examService } from '../../services/examService';
import { toast } from 'react-toastify';

export const useExamAttempt = (attemptId, onAutoSubmit) => {
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [attempt, setAttempt] = useState(null);
    const [visited, setVisited] = useState(new Set([0]));
    const [currentIdx, setCurrentIdx] = useState(0);
    const [status, setStatus] = useState('STARTED');
    const [warningCount, setWarningCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    
    const saveAbortControllerRef = useRef(null);
    const warningTimeoutRef = useRef(null);

    // Load initial state
    useEffect(() => {
        if (!attemptId || attemptId === 'undefined') {
            setLoading(false);
            return;
        }
        
        const fetchInitialState = async () => {
            try {
                const [questionsData, savedAnswers, attemptData] = await Promise.all([
                    examService.getAttemptQuestions(attemptId),
                    examService.getSavedResponses(attemptId),
                    examService.getAttemptByIdForSystem(attemptId)
                ]);
                
                setQuestions(questionsData || []);
                setAnswers(savedAnswers || {});
                setAttempt(attemptData);
                
                // Mark answered questions as visited
                const answeredIndices = questionsData
                    .map((q, idx) => savedAnswers[q.id] ? idx : null)
                    .filter(idx => idx !== null);
                
                setVisited(prev => {
                    const next = new Set(prev);
                    answeredIndices.forEach(idx => next.add(idx));
                    return next;
                });

                setLoading(false);
            } catch (error) {
                toast.error("Failed to load exam state.");
                setLoading(false);
            }
        };
        fetchInitialState();
    }, [attemptId]);

    const handleOptionSelect = useCallback(async (questionId, optionId) => {
        // 1. UI Update (Optimistic)
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));

        // 2. Race Condition / Spam Protection
        if (saveAbortControllerRef.current) {
            saveAbortControllerRef.current.abort();
        }
        saveAbortControllerRef.current = new AbortController();

        setIsSyncing(true);
        try {
            await examService.saveResponse(attemptId, {
                questionId,
                selectedOption: optionId
            }, { signal: saveAbortControllerRef.current.signal });
        } catch (error) {
            if (error.name === 'AbortError') return;
            toast.error("Sync failed. Check your connection.");
        } finally {
            setIsSyncing(false);
        }
    }, [attemptId]);

    const markVisited = useCallback((idx) => {
        setVisited(prev => {
            if (prev.has(idx)) return prev;
            const next = new Set(prev);
            next.add(idx);
            return next;
        });
    }, []);

    const handleVisibilityChange = useCallback(() => {
        if (document.visibilityState === 'hidden' && status === 'STARTED' && attemptId) {
            if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
            
            setWarningCount(prev => {
                const next = prev + 1;
                if (next >= 3) {
                    toast.error("Security violation limit reached. Auto-submitting...");
                    if (onAutoSubmit) onAutoSubmit("Security Violation");
                } else {
                    toast.warning(`Security Alert #${next}: Please stay on the exam tab.`);
                }
                return next;
            });
        }
    }, [status]);

    useEffect(() => {
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [handleVisibilityChange]);

    return {
        loading,
        questions,
        answers,
        attempt,
        visited,
        currentIdx, setCurrentIdx,
        status, setStatus,
        warningCount,
        isSyncing,
        handleOptionSelect,
        markVisited
    };
};
