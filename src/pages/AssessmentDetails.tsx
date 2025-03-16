
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, Calendar, CheckCircle, Clock, Download, FileText, Search, XCircle 
} from 'lucide-react';
import AnimatedCard from '@/components/AnimatedCard';
import PageTransition from '@/components/PageTransition';
import { useParams, Link, Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const AssessmentDetails = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const { 
    currentUser, 
    getAssessmentById, 
    getAssessmentSubmissions,
    students, 
    awardMarks 
  } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [marksToAward, setMarksToAward] = useState<string>('');
  
  if (!currentUser || currentUser.role !== 'teacher') {
    return <Navigate to="/unauthorized" />;
  }

  const assessment = assessmentId ? getAssessmentById(assessmentId) : undefined;
  
  if (!assessment) {
    return <Navigate to="/teacher-assessments" />;
  }
  
  if (assessment.createdBy !== currentUser.id) {
    return <Navigate to="/unauthorized" />;
  }
  
  const submissions = getAssessmentSubmissions(assessment.id);
  
  // Get all students created by this teacher
  const teacherStudents = students.filter(
    student => student.createdBy === currentUser.id
  );
  
  // Map to get complete submission status for all students
  const studentSubmissions = teacherStudents.map(student => {
    const submission = submissions.find(s => s.studentId === student.id);
    return {
      student,
      submission
    };
  });
  
  const filteredStudentSubmissions = studentSubmissions.filter(
    ({ student }) => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Calculate total possible marks for this assessment
  const totalPossibleMarks = assessment.questions.reduce(
    (total, question) => total + question.marks, 
    0
  );
  
  const selectedSubmissionData = submissions.find(s => s.id === selectedSubmission);
  const selectedStudent = selectedSubmissionData
    ? students.find(s => s.id === selectedSubmissionData.studentId)
    : null;
  
  const handleAwardMarks = async () => {
    if (!selectedSubmission) return;
    
    try {
      const marks = parseInt(marksToAward);
      if (isNaN(marks) || marks < 0 || marks > totalPossibleMarks) {
        throw new Error(`Marks must be between 0 and ${totalPossibleMarks}`);
      }
      
      await awardMarks(selectedSubmission, marks);
      setSelectedSubmission(null);
    } catch (error) {
      console.error(error);
    }
  };

  const downloadExcel = () => {
    // Create data for Excel
    const data = filteredStudentSubmissions.map(({ student, submission }) => {
      // Get all answers in a structured format
      const studentAnswers: Record<string, string> = {};
      const correctAnswers: Record<string, string> = {};
      let numCorrect = 0;
      
      if (submission) {
        assessment.questions.forEach(question => {
          const studentAnswer = submission.answers.find(a => a.questionId === question.id)?.answer || '';
          studentAnswers[`Q${question.id}`] = studentAnswer;
          
          if (question.correctAnswer) {
            correctAnswers[`Q${question.id}_correct`] = question.correctAnswer;
            if (studentAnswer === question.correctAnswer) {
              numCorrect++;
            }
          }
        });
      }

      return {
        'Student Name': student.name,
        'Email': student.email,
        'Status': submission 
          ? (submission.isCompleted ? 'Completed' : 'Incomplete') 
          : 'Not Started',
        'Submission Date': submission 
          ? format(new Date(submission.submittedAt), 'yyyy-MM-dd HH:mm') 
          : '-',
        'Marks': submission?.marksAwarded !== undefined 
          ? `${submission.marksAwarded}/${totalPossibleMarks}`
          : '-',
        'Auto-calculated Score': submission?.isCompleted 
          ? `${numCorrect} correct answers`
          : '-',
        ...studentAnswers,
        ...correctAnswers
      };
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Assessment Results');
    
    // Generate Excel file
    XLSX.writeFile(wb, `${assessment.title} - Results.xlsx`);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild 
                  className="h-8 px-2"
                >
                  <Link to="/teacher-assessments">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Link>
                </Button>
                <h1 className="text-3xl font-semibold text-gray-900">
                  {assessment.title}
                </h1>
              </div>
              <p className="text-gray-500">
                {assessment.description || "No description provided"}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-md">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Due: {format(new Date(assessment.dueDate), 'PPP')}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-md">
                <FileText className="h-4 w-4 mr-2" />
                <span>{assessment.questions.length} Questions</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-md">
                <span>Total Marks: {totalPossibleMarks}</span>
              </div>
            </div>
          </header>

          <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button 
              variant="outline" 
              onClick={downloadExcel}
              disabled={filteredStudentSubmissions.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Excel Report
            </Button>
          </div>

          <AnimatedCard contentClassName="p-0" delay={0.2}>
            {filteredStudentSubmissions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submission Date</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudentSubmissions.map(({ student, submission }) => (
                    <TableRow key={student.id} className="reveal" style={{animationDelay: '0.1s'}}>
                      <TableCell className="font-medium">
                        <div>
                          {student.name}
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {submission ? (
                          submission.isCompleted ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <CheckCircle className="h-3 w-3 mr-1" /> Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50">
                              <Clock className="h-3 w-3 mr-1" /> Incomplete
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                            <XCircle className="h-3 w-3 mr-1" /> Not Started
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {submission ? format(new Date(submission.submittedAt), 'PPP') : '-'}
                      </TableCell>
                      <TableCell>
                        {submission?.marksAwarded !== undefined 
                          ? `${submission.marksAwarded}/${totalPossibleMarks}` 
                          : (submission ? 'Not graded' : '-')
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        {submission && (
                          <Button 
                            variant="outline"
                            size="sm"
                            disabled={!submission.isCompleted}
                            onClick={() => {
                              setSelectedSubmission(submission.id);
                              setMarksToAward(submission.marksAwarded?.toString() || '');
                            }}
                          >
                            {submission.marksAwarded !== undefined ? 'Update Marks' : 'Award Marks'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <FileText className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No students found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? "No students match your search criteria"
                    : "You haven't added any students yet"}
                </p>
                {searchQuery ? (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                ) : (
                  <Button asChild>
                    <Link to="/teacher-dashboard">
                      Add Students
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </AnimatedCard>
        </div>
      </div>

      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Award Marks</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <p className="font-medium">{selectedStudent?.name}</p>
              <p className="text-gray-500 text-sm">{selectedStudent?.email}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Marks (out of {totalPossibleMarks})
              </label>
              <Input
                type="number"
                min="0"
                max={totalPossibleMarks}
                value={marksToAward}
                onChange={(e) => setMarksToAward(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
              Cancel
            </Button>
            <Button onClick={handleAwardMarks}>
              Save Marks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default AssessmentDetails;
