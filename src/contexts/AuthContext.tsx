
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  createdBy?: string;
};

type Student = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdBy: string;
};

type AuthContextType = {
  currentUser: User | null;
  students: Student[];
  teachers: User[];
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createStudent: (name: string, email: string) => Promise<Student>;
  addTeacher: (name: string, email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for teachers
const initialTeachers: User[] = [
  { id: '1', name: 'Teacher 1', email: 'teacher1@example.com', role: 'teacher' },
  { id: '2', name: 'Teacher 2', email: 'teacher2@example.com', role: 'teacher' },
  { id: '3', name: 'Teacher 3', email: 'teacher3@example.com', role: 'teacher' },
  { id: '4', name: 'Teacher 4', email: 'teacher4@example.com', role: 'teacher' },
  { id: '5', name: 'Teacher 5', email: 'teacher5@example.com', role: 'teacher' },
  { id: '6', name: 'Teacher 6', email: 'teacher6@example.com', role: 'teacher' },
  { id: '7', name: 'Teacher 7', email: 'teacher7@example.com', role: 'teacher' },
  { id: '8', name: 'Teacher 8', email: 'teacher8@example.com', role: 'teacher' },
];

// Mock passwords (in a real app, these would be securely hashed)
const teacherPasswords: Record<string, string> = {
  'teacher1@example.com': 'password1',
  'teacher2@example.com': 'password2',
  'teacher3@example.com': 'password3',
  'teacher4@example.com': 'password4',
  'teacher5@example.com': 'password5',
  'teacher6@example.com': 'password6',
  'teacher7@example.com': 'password7',
  'teacher8@example.com': 'password8',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<User[]>(initialTeachers);
  const [loading, setLoading] = useState(true);

  // Check for saved login on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }
    
    setLoading(false);
  }, []);

  // Save students to localStorage whenever they change
  useEffect(() => {
    if (students.length > 0) {
      localStorage.setItem('students', JSON.stringify(students));
    }
  }, [students]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // First check if it's a teacher login
      const teacher = teachers.find(t => t.email === email);
      if (teacher && teacherPasswords[email] === password) {
        setCurrentUser(teacher);
        localStorage.setItem('currentUser', JSON.stringify(teacher));
        toast.success(`Welcome back, ${teacher.name}`);
        return true;
      }
      
      // Then check if it's a student login
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

  // Generate a random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const createStudent = async (name: string, email: string): Promise<Student> => {
    if (!currentUser || currentUser.role !== 'teacher') {
      throw new Error('Only teachers can create students');
    }
    
    // Check if student with this email already exists
    if (students.some(s => s.email === email)) {
      throw new Error('A student with this email already exists');
    }
    
    const password = generatePassword();
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

  const addTeacher = async (name: string, email: string, password: string): Promise<void> => {
    // Check if teacher with this email already exists
    if (teachers.some(t => t.email === email)) {
      throw new Error('A teacher with this email already exists');
    }
    
    const newTeacher: User = {
      id: Date.now().toString(),
      name,
      email,
      role: 'teacher',
    };
    
    // In a real app, you would hash the password before storing
    (teacherPasswords as any)[email] = password;
    
    setTeachers(prev => [...prev, newTeacher]);
    toast.success(`Teacher ${name} added successfully`);
  };

  const value = {
    currentUser,
    students,
    teachers,
    loading,
    login,
    logout,
    createStudent,
    addTeacher,
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
