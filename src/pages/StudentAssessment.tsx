
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Radio } from '@/components/ui/radio-group';
import { ArrowLeft, Calendar, CheckCircle, Clock, FileText } from 'lucide-react';
import AnimatedCard from '@/components/AnimatedCard';
import PageTransition from '@/components/PageTransition';
import { useParams, Link, Navigate } from 'react-router-dom';
import { format, isPast } from 'date-fns';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const StudentAssessment = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const { 
    currentUser, 
    getAssessmentById, 
    getSubmission,
    submitAssessment,
  } = useAuth();
  
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!currentUser || currentUser.role !== 'student') {
    return <Navigate to="/unauthorized" />;
  }

  const assessment = assessmentId ? getAssessmentById(assessmentId) : undefined;
  
  if (!assessment) {
    return <Navigate to="/student-dashboard" />;
  }
  
  const submission = getSubmission(assessment.id, currentUser.id);
  const isOverdue = isPast(new Date(assessment.dueDate));
  const isCompleted = submission?.isCompleted || false;
  
  // Calculate total possible marks for this assessment
  const totalPossibleMarks = assessment.questions.reduce(
    (total, question) => total + question.marks, 
    0
  );
  
  // Load existing answers if there's a submission
  useEffect(() => {
    if (submission) {
      const existingAnswers: { [questionId: string]: string } = {};
      submission.answers.forEach(ans => {
        existingAnswers[ans.questionId] = ans.answer;
      });
      setAnswers(existingAnswers);
    }
  }, [submission]);
  
  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const handleSubmit = async (finalSubmit: boolean) => {
    setIsSubmitting(true);
    
    try {
      // Format answers as required by the API
      const answersArray = Object.entries(answers)
        .filter(([_, value]) => value.trim() !== '') // Filter out empty answers
        .map(([questionId, answer]) => ({
          questionId,
          answer
        }));
      
      // Submit the assessment
      await submitAssessment(
        assessment.id,
        currentUser.id,
        answersArray
      );
      
      if (finalSubmit) {
        toast.success('Assessment submitted successfully');
      } else {
        toast.success('Progress saved');
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const answeredQuestions = Object.keys(answers).length;
  const totalQuestions = assessment.questions.length;
  const progress = Math.round((answeredQuestions / totalQuestions) * 100);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild 
                  className="h-8 px-2"
                >
                  <Link to="/student-dashboard">
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
            
            <div className="space-y-2 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row">
              <div className="flex items-center text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-md">
                <Calendar className="h-4 w-4 mr-2" />
                <span className={isOverdue ? 'text-red-500' : ''}>
                  Due: {format(new Date(assessment.dueDate), 'PPP')}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-md">
                <FileText className="h-4 w-4 mr-2" />
                <span>Total Marks: {totalPossibleMarks}</span>
              </div>
            </div>
          </header>

          {isCompleted ? (
            <AnimatedCard delay={0.1}>
              <div className="flex flex-col items-center py-6">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Assessment Completed</h2>
                <p className="text-gray-500 mb-4 text-center">
                  You have successfully completed this assessment.
                </p>
                
                {submission?.marksAwarded !== undefined && (
                  <div className="mt-4 text-center">
                    <h3 className="text-lg font-medium mb-2">Your Results</h3>
                    <div className="text-3xl font-bold">
                      {submission.marksAwarded} / {totalPossibleMarks}
                    </div>
                    <p className="text-gray-500 mt-2">
                      {Math.round((submission.marksAwarded / totalPossibleMarks) * 100)}% Score
                    </p>
                  </div>
                )}
                
                <Button asChild className="mt-6">
                  <Link to="/student-dashboard">
                    Return to Dashboard
                  </Link>
                </Button>
              </div>
            </AnimatedCard>
          ) : (
            <>
              {!isOverdue && (
                <div className="mb-6">
                  <div className="bg-white rounded-lg p-4 border flex flex-col sm:flex-row justify-between items-center">
                    <div className="flex items-center mb-4 sm:mb-0">
                      <Clock className="h-5 w-5 text-blue-500 mr-2" />
                      <div>
                        <h3 className="font-medium">Your Progress</h3>
                        <p className="text-sm text-gray-500">
                          {answeredQuestions} of {totalQuestions} questions answered
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        onClick={() => handleSubmit(false)}
                        disabled={isSubmitting || Object.keys(answers).length === 0}
                        className="flex-1 sm:flex-initial"
                      >
                        Save Progress
                      </Button>
                      <Button 
                        onClick={() => handleSubmit(true)}
                        disabled={isSubmitting || progress < 100}
                        className="flex-1 sm:flex-initial"
                      >
                        Submit Assessment
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-6">
                {assessment.questions.map((question, index) => (
                  <Card key={question.id} className="reveal" style={{animationDelay: `${0.05 * index}s`}}>
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <span>Question {index + 1}</span>
                        <Badge variant="outline">
                          {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-base text-gray-800">
                        {question.text}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {question.type === 'text' ? (
                        <Textarea
                          placeholder="Enter your answer here..."
                          value={answers[question.id] || ''}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          disabled={isOverdue || isCompleted}
                          className="min-h-[100px]"
                        />
                      ) : (
                        <div className="space-y-3">
                          {question.options?.map((option, optIndex) => (
                            <div 
                              key={optIndex} 
                              className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer"
                              onClick={() => !isOverdue && !isCompleted && handleAnswerChange(question.id, option)}
                            >
                              <input
                                type="radio"
                                id={`q-${question.id}-opt-${optIndex}`}
                                name={`question-${question.id}`}
                                checked={answers[question.id] === option}
                                onChange={() => handleAnswerChange(question.id, option)}
                                disabled={isOverdue || isCompleted}
                                className="h-4 w-4"
                              />
                              <label 
                                htmlFor={`q-${question.id}-opt-${optIndex}`}
                                className="flex-1 cursor-pointer"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {isOverdue && (
                <AnimatedCard delay={0.3} className="mt-6 bg-red-50 border-red-200">
                  <div className="flex items-center text-red-700">
                    <Clock className="h-5 w-5 mr-2" />
                    <div>
                      <h3 className="font-medium">Assessment Overdue</h3>
                      <p className="text-sm">
                        This assessment is past its due date. You can no longer submit answers.
                      </p>
                    </div>
                  </div>
                </AnimatedCard>
              )}
              
              {!isOverdue && (
                <div className="flex justify-end space-x-2 mt-6 mb-12">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting || Object.keys(answers).length === 0}
                  >
                    Save Progress
                  </Button>
                  <Button 
                    onClick={() => handleSubmit(true)}
                    disabled={isSubmitting || progress < 100}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default StudentAssessment;
