export const EXAM_TEMPLATES = [
    // 1. QUIZ (MCQ)
    {
        id: 'quiz_gen_knowledge',
        title: 'General Knowledge Quiz',
        course: 'General Studies',
        questions: [
            { type: 'quiz', marks: 2, question: 'What is the capital of France?', options: ['London', 'Berlin', 'Paris', 'Madrid'], correctOption: 2 },
            { type: 'quiz', marks: 2, question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctOption: 1 },
            { type: 'quiz', marks: 2, question: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correctOption: 3 }
        ]
    },
    // 2. SHORT ANSWER
    {
        id: 'short_history',
        title: 'History Briefs',
        course: 'History 101',
        questions: [
            { type: 'short', marks: 5, question: 'Briefly explain the cause of World War I.' },
            { type: 'short', marks: 5, question: 'What was the significance of the Magna Carta?' },
            { type: 'short', marks: 5, question: 'Define the Industrial Revolution.' }
        ]
    },
    // 3. LONG ANSWER (ESSAY)
    {
        id: 'long_english_lit',
        title: 'English Literature Analysis',
        course: 'English Literature',
        questions: [
            { type: 'long', marks: 20, question: 'Analyze the theme of ambition in Macbeth. Support your answer with quotes from the play.' },
            { type: 'long', marks: 20, question: 'Compare and contrast the writing styles of Hemingway and Fitzgerald.' }
        ]
    },
    // 4. CODING
    {
        id: 'code_ds_algo',
        title: 'Data Structures & Algorithms',
        course: 'Computer Science',
        questions: [
            { type: 'coding', marks: 20, question: 'Implement a Binary Search Algorithm', language: 'python', starterCode: 'def binary_search(arr, target):\n    # Returns index of target in arr, or -1 if not found\n    pass' },
            { type: 'coding', marks: 20, question: 'Detect Cycle in a Linked List', language: 'java', starterCode: 'class ListNode {\n    int val;\n    ListNode next;\n    ListNode(int x) {\n        val = x;\n        next = null;\n    }\n}\n\npublic class Solution {\n    public boolean hasCycle(ListNode head) {\n        // Your code here\n    }\n}' }
        ]
    },
    // 5. ABACUS (SKILL-BASED)
    {
        id: 'abacus_lvl1',
        title: 'Abacus Level 1 Assessment',
        course: 'Mental Math',
        questions: [
            { type: 'short', marks: 2, question: 'Solve: 12 + 5 - 3' },
            { type: 'short', marks: 2, question: 'Solve: 4 + 4 + 1' },
            { type: 'short', marks: 2, question: 'Solve: 50 + 20 - 10' },
            { type: 'short', marks: 2, question: 'Visualize & Solve: 9 - 4 + 3' },
            { type: 'short', marks: 5, question: 'Speed Round: 2 + 2 + 2 + 2 + 2' }
        ]
    }
];
