import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student' | 'admin';
  createdBy?: string;
};

type Student = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdBy: string;
};

type Question = {
  id: string;
  text: string;
  options?: string[];
  correctAnswer?: string;
  marks: number;
  type: 'text' | 'multiple-choice';
};

type Assessment = {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  dueDate: string;
  questions: Question[];
  createdAt: string;
};

type Submission = {
  id: string;
  assessmentId: string;
  studentId: string;
  answers: {
    questionId: string;
    answer: string;
  }[];
  submittedAt: string;
  isCompleted: boolean;
  marksAwarded?: number;
  autoGradedMarks?: number;
};

type AuthContextType = {
  currentUser: User | null;
  students: Student[];
  teachers: User[];
  assessments: Assessment[];
  submissions: Submission[];
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createStudent: (name: string, email: string, password: string) => Promise<Student>;
  deleteStudent: (studentId: string) => Promise<void>;
  addTeacher: (name: string, email: string, password: string) => Promise<void>;
  createAssessment: (
    title: string,
    description: string,
    dueDate: string,
    questions: Omit<Question, 'id'>[]
  ) => Promise<Assessment>;
  getTeacherAssessments: (teacherId: string) => Assessment[];
  getStudentAssessments: (studentId: string) => Assessment[];
  submitAssessment: (
    assessmentId: string,
    studentId: string,
    answers: {
      questionId: string;
      answer: string;
    }[]
  ) => Promise<void>;
  getSubmission: (assessmentId: string, studentId: string) => Submission | undefined;
  getAssessmentSubmissions: (assessmentId: string) => Submission[];
  awardMarks: (submissionId: string, marksAwarded: number) => Promise<void>;
  getAssessmentById: (assessmentId: string) => Assessment | undefined;
  getAllAssessments: () => Assessment[];
  getAllSubmissions: () => Submission[];
  getAllStudents: () => Student[];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialTeachers: User[] = [
  { id: '1', name: 'Teacher Aiden', email: 'teacher1@example.com', role: 'teacher' },
  { id: '2', name: 'Teacher Bella', email: 'teacher2@example.com', role: 'teacher' },
  { id: '3', name: 'Teacher Carlos', email: 'teacher3@example.com', role: 'teacher' },
  { id: '4', name: 'Teacher Diana', email: 'teacher4@example.com', role: 'teacher' },
  { id: '5', name: 'Teacher Ethan', email: 'teacher5@example.com', role: 'teacher' },
  { id: '6', name: 'Teacher Fiona', email: 'teacher6@example.com', role: 'teacher' },
  { id: '7', name: 'Teacher George', email: 'teacher7@example.com', role: 'teacher' },
  { id: '8', name: 'Teacher Hannah', email: 'teacher8@example.com', role: 'teacher' },
];

const adminUser: User = { id: 'admin1', name: 'Admin User', email: 'admin@example.com', role: 'admin' };

const teacherPasswords: Record<string, string> = {
  'teacher1@example.com': 'password1',
  'teacher2@example.com': 'password2',
  'teacher3@example.com': 'password3',
  'teacher4@example.com': 'password4',
  'teacher5@example.com': 'password5',
  'teacher6@example.com': 'password6',
  'teacher7@example.com': 'password7',
  'teacher8@example.com': 'password8',
  'admin@example.com': 'adminpass',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<User[]>([...initialTeachers, adminUser]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }
    
    const savedAssessments = localStorage.getItem('assessments');
    if (savedAssessments) {
      setAssessments(JSON.parse(savedAssessments));
    }
    
    const savedSubmissions = localStorage.getItem('submissions');
    if (savedSubmissions) {
      setSubmissions(JSON.parse(savedSubmissions));
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      localStorage.setItem('students', JSON.stringify(students));
    }
  }, [students]);
  
  useEffect(() => {
    if (assessments.length > 0) {
      localStorage.setItem('assessments', JSON.stringify(assessments));
    }
  }, [assessments]);
  
  useEffect(() => {
    if (submissions.length > 0) {
      localStorage.setItem('submissions', JSON.stringify(submissions));
    }
  }, [submissions]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const user = teachers.find(t => t.email === email);
      if (user && teacherPasswords[email] === password) {
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        toast.success(`Welcome back, ${user.name}`);
        return true;
      }
      
      const student = students.find(s => s.email === email && s.password === password);
      if (student) {
        const studentUser: User = {
          id: student.id,
          name: student.name,
          email: student.email,
          role: 'student',
          createdBy: student.createdBy
        };
        setCurrentUser(studentUser);
        localStorage.setItem('currentUser', JSON.stringify(studentUser));
        toast.success(`Welcome, ${student.name}`);
        return true;
      }
      
      toast.error('Invalid email or password');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    toast.info('You have been logged out');
  };

  const createStudent = async (name: string, email: string, password: string): Promise<Student> => {
    if (!currentUser || currentUser.role !== 'teacher') {
      throw new Error('Only teachers can create students');
    }
    
    if (students.some(s => s.email === email)) {
      throw new Error('A student with this email already exists');
    }
    
    const newStudent: Student = {
      id: Date.now().toString(),
      name,
      email,
      password,
      createdBy: currentUser.id,
    };
    
    setStudents(prev => [...prev, newStudent]);
    toast.success(`Student ${name} created successfully`);
    return newStudent;
  };

  const deleteStudent = async (studentId: string): Promise<void> => {
    if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'admin')) {
      throw new Error('Only teachers and admins can delete students');
    }
    
    const studentToDelete = students.find(s => s.id === studentId);
    
    if (!studentToDelete) {
      throw new Error('Student not found');
    }
    
    // For teachers, only allow deletion of students they created
    if (currentUser.role === 'teacher' && studentToDelete.createdBy !== currentUser.id) {
      throw new Error('You can only delete students you created');
    }
    
    // Remove student's submissions
    const updatedSubmissions = submissions.filter(s => s.studentId !== studentId);
    setSubmissions(updatedSubmissions);
    
    // Remove the student
    const updatedStudents = students.filter(s => s.id !== studentId);
    setStudents(updatedStudents);
    
    toast.success(`Student ${studentToDelete.name} deleted successfully`);
  };

  const addTeacher = async (name: string, email: string, password: string): Promise<void> => {
    if (teachers.some(t => t.email === email)) {
      throw new Error('A teacher with this email already exists');
    }
    
    const newTeacher: User = {
      id: Date.now().toString(),
      name,
      email,
      role: 'teacher',
    };
    
    (teacherPasswords as any)[email] = password;
    
    setTeachers(prev => [...prev, newTeacher]);
    toast.success(`Teacher ${name} added successfully`);
  };

  const createAssessment = async (
    title: string,
    description: string,
    dueDate: string,
    questions: Omit<Question, 'id'>[]
  ): Promise<Assessment> => {
    if (!currentUser || currentUser.role !== 'teacher') {
      throw new Error('Only teachers can create assessments');
    }
    
    const questionsWithIds = questions.map(q => ({
      ...q,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9)
    }));
    
    const newAssessment: Assessment = {
      id: Date.now().toString(),
      title,
      description,
      createdBy: currentUser.id,
      dueDate,
      questions: questionsWithIds,
      createdAt: new Date().toISOString(),
    };
    
    setAssessments(prev => [...prev, newAssessment]);
    toast.success(`Assessment "${title}" created successfully`);
    return newAssessment;
  };

  const getTeacherAssessments = (teacherId: string): Assessment[] => {
    return assessments.filter(assessment => assessment.createdBy === teacherId);
  };

  const getStudentAssessments = (studentId: string): Assessment[] => {
    const student = students.find(s => s.id === studentId);
    if (!student) return [];
    
    return assessments.filter(assessment => assessment.createdBy === student.createdBy);
  };

  const submitAssessment = async (
    assessmentId: string,
    studentId: string,
    answers: { questionId: string; answer: string }[]
  ): Promise<void> => {
    const assessment = assessments.find(a => a.id === assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }
    
    const isCompleted = answers.length === assessment.questions.length;
    
    let autoGradedMarks = 0;
    if (isCompleted) {
      assessment.questions.forEach(question => {
        if (question.type === 'multiple-choice' && question.correctAnswer) {
          const studentAnswer = answers.find(a => a.questionId === question.id)?.answer;
          if (studentAnswer === question.correctAnswer) {
            autoGradedMarks += question.marks;
          }
        }
      });
    }
    
    const existingSubmission = submissions.find(
      s => s.assessmentId === assessmentId && s.studentId === studentId
    );
    
    if (existingSubmission) {
      setSubmissions(prev => 
        prev.map(s => 
          s.id === existingSubmission.id 
            ? {
                ...s,
                answers,
                submittedAt: new Date().toISOString(),
                isCompleted,
                autoGradedMarks: isCompleted ? autoGradedMarks : undefined
              }
            : s
        )
      );
    } else {
      const newSubmission: Submission = {
        id: Date.now().toString(),
        assessmentId,
        studentId,
        answers,
        submittedAt: new Date().toISOString(),
        isCompleted,
        autoGradedMarks: isCompleted ? autoGradedMarks : undefined
      };
      
      setSubmissions(prev => [...prev, newSubmission]);
    }
    
    toast.success(
      isCompleted 
        ? 'Assessment submitted successfully' 
        : 'Assessment saved as draft'
    );
  };

  const getSubmission = (assessmentId: string, studentId: string): Submission | undefined => {
    return submissions.find(
      s => s.assessmentId === assessmentId && s.studentId === studentId
    );
  };

  const getAssessmentSubmissions = (assessmentId: string): Submission[] => {
    return submissions.filter(s => s.assessmentId === assessmentId);
  };

  const awardMarks = async (submissionId: string, marksAwarded: number): Promise<void> => {
    setSubmissions(prev => 
      prev.map(s => 
        s.id === submissionId 
          ? { ...s, marksAwarded } 
          : s
      )
    );
    
    toast.success('Marks awarded successfully');
  };

  const getAssessmentById = (assessmentId: string): Assessment | undefined => {
    return assessments.find(a => a.id === assessmentId);
  };

  const getAllAssessments = (): Assessment[] => {
    if (!currentUser || currentUser.role !== 'admin') {
      return [];
    }
    return assessments;
  };

  const getAllSubmissions = (): Submission[] => {
    if (!currentUser || currentUser.role !== 'admin') {
      return [];
    }
    return submissions;
  };

  const getAllStudents = (): Student[] => {
    if (!currentUser || currentUser.role !== 'admin') {
      return [];
    }
    return students;
  };

  const value = {
    currentUser,
    students,
    teachers,
    assessments,
    submissions,
    loading,
    login,
    logout,
    createStudent,
    deleteStudent,
    addTeacher,
    createAssessment,
    getTeacherAssessments,
    getStudentAssessments,
    submitAssessment,
    getSubmission,
    getAssessmentSubmissions,
    awardMarks,
    getAssessmentById,
    getAllAssessments,
    getAllSubmissions,
    getAllStudents,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
