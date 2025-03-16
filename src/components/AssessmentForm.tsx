
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

interface AssessmentFormProps {
  onSubmit: (title: string, description: string, dueDate: string, questions: any[]) => Promise<void>;
  onCancel: () => void;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({ onSubmit, onCancel }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [questions, setQuestions] = useState<any[]>([
    { text: '', options: ['', '', '', ''], correctOption: 0 }
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: '', options: ['', '', '', ''], correctOption: 0 }
    ]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !description || !dueDate) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate date - using getTime() for proper date comparison
    if (new Date(dueDate).getTime() < Date.now()) {
      toast({
        title: "Invalid Date",
        description: "Due date must be in the future.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate questions
    const isValidQuestions = questions.every(q => 
      q.text && q.options.every((opt: string) => opt.trim() !== '')
    );
    
    if (!isValidQuestions) {
      toast({
        title: "Incomplete Questions",
        description: "All questions and options must be filled out.",
        variant: "destructive"
      });
      return;
    }

    try {
      await onSubmit(title, description, dueDate, questions);
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast({
        title: "Error",
        description: "Failed to create assessment. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Assessment</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Assessment Title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Assessment Description"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Questions</Label>
            {questions.map((question, qIndex) => (
              <Card key={qIndex} className="p-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`question-${qIndex}`}>Question {qIndex + 1}</Label>
                    <Input
                      id={`question-${qIndex}`}
                      value={question.text}
                      onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                      placeholder="Enter question text"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Options</Label>
                    {question.options.map((option: string, oIndex: number) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuestion(qIndex, 'correctOption', oIndex)}
                          className={question.correctOption === oIndex ? "bg-green-100" : ""}
                        >
                          {question.correctOption === oIndex ? "Correct" : "Mark Correct"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={addQuestion}>
              Add Question
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Create Assessment</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AssessmentForm;
