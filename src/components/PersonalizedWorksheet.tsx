import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap } from "lucide-react";
import PerLOFormatEditor from "./PerLOFormatEditor";

// Mock types local to this flow to avoid coupling to backend types yet
type QuestionTypeOption = "MCQ" | "ShortAnswer" | "LongAnswer";
type MockStudent = {
  id: string;
  name: string;
  grade: number;
};
type MockSchool = {
  udise: string;
  name: string;
  address: string;
};
const mockFetchSchoolAndStudents = async (udise: string) => {
  // Simulate network
  await new Promise(r => setTimeout(r, 400));
  const school: MockSchool = {
    udise,
    name: "Springfield Public School",
    address: "742 Evergreen Terrace, Springfield"
  };
  const students: MockStudent[] = Array.from({
    length: 12
  }).map((_, i) => ({
    id: `stu-${i + 1}`,
    name: `Student ${i + 1}`,
    grade: 5
  }));
  const assessments = [{
    id: "assess-lep",
    name: "LEP Diagnostic Assessment"
  }, {
    id: "assess-mid",
    name: "Mid-term Diagnostic"
  }];
  return {
    school,
    students,
    assessments
  };
};
const questionTypeOptions: {
  key: QuestionTypeOption;
  label: string;
}[] = [{
  key: "MCQ",
  label: "Multiple Choice"
}, {
  key: "ShortAnswer",
  label: "Short Answer"
}, {
  key: "LongAnswer",
  label: "Long Answer"
}];
type DifficultyOption = "Easy" | "Medium" | "Hard";
type LOConfig = {
  loCode: string;
  label: string;
  types: QuestionTypeOption[];
  count: number;
  difficulty: DifficultyOption;
};
const mockFetchAssessmentLOs = async (assessmentId: string): Promise<LOConfig[]> => {
  // Simulate network
  await new Promise(r => setTimeout(r, 200));
  const base: LOConfig[] = [{
    loCode: "LO-101",
    label: "Place value and numeration",
    types: ["MCQ"],
    count: 5,
    difficulty: "Easy"
  }, {
    loCode: "LO-205",
    label: "Addition and subtraction word problems",
    types: ["MCQ", "ShortAnswer"],
    count: 5,
    difficulty: "Medium"
  }, {
    loCode: "LO-309",
    label: "Fractions fundamentals",
    types: ["MCQ"],
    count: 5,
    difficulty: "Medium"
  }];
  if (assessmentId === "assess-lep") {
    return base;
  }
  return base.map((lo, i) => ({
    ...lo,
    loCode: `LO-${400 + i}`,
    difficulty: "Hard" as DifficultyOption
  }));
};
const Section = ({
  title,
  children,
  description
}: {
  title: string;
  children: React.ReactNode;
  description?: string;
}) => <section className="space-y-3">
    <h2 className="text-xl font-semibold text-foreground">{title}</h2>
    {description && <p className="text-sm text-muted-foreground">{description}</p>}
    {children}
  </section>;
const StepHeader = ({
  step,
  label,
  Icon
}: {
  step: number;
  label: string;
  Icon: React.ComponentType<any>;
}) => <div className="flex items-center gap-3">
    <Badge variant="secondary" className="text-xs">Step {step}</Badge>
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
    </div>
  </div>;
const PersonalizedWorksheet: React.FC = () => {
  const {
    toast
  } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [udise, setUdise] = useState("");

  // Step 2
  const [school, setSchool] = useState<MockSchool | null>(null);
  const [students, setStudents] = useState<MockStudent[]>([]);
  const [assessments, setAssessments] = useState<{
    id: string;
    name: string;
  }[]>([]);

  // Step 3
  const [selectedAssessment, setSelectedAssessment] = useState<string>("");

  // Step 4
  const [method, setMethod] = useState<"bulk" | "individual">("bulk");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Step 5
  const [selectedTypes, setSelectedTypes] = useState<QuestionTypeOption[]>(["MCQ"]);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [loConfigs, setLoConfigs] = useState<LOConfig[]>([]);
  const [unifiedFormat, setUnifiedFormat] = useState(true);
  const [studentSpecificConfigs, setStudentSpecificConfigs] = useState<{[studentId: string]: LOConfig[]}>({});
  useEffect(() => {
    if (!selectedAssessment) return;
    mockFetchAssessmentLOs(selectedAssessment).then(setLoConfigs);
  }, [selectedAssessment]);
  const canGoNext = useMemo(() => {
    if (step === 1) return udise.trim().length >= 6;
    if (step === 2) return !!school && students.length > 0;
    if (step === 3) return !!selectedAssessment;
    if (step === 4) return method === "bulk" ? students.length > 0 : selectedStudents.length > 0;
    if (step === 5) {
      if (loConfigs.length === 0) return false;
      return loConfigs.every(lo => lo.count > 0 && lo.types.length > 0);
    }
    return true;
  }, [step, udise, school, students.length, selectedAssessment, selectedStudents.length, method, loConfigs]);
  const handleFetch = async () => {
    if (!udise) return;
    setLoading(true);
    try {
      const {
        school,
        students,
        assessments
      } = await mockFetchSchoolAndStudents(udise);
      setSchool(school);
      setStudents(students);
      setAssessments(assessments);
      toast({
        title: "Mock data loaded",
        description: `Found ${students.length} students for UDISE ${udise}.`
      });
      setStep(2);
    } finally {
      setLoading(false);
    }
  };
  const toggleStudent = (id: string) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };
  const toggleType = (key: QuestionTypeOption) => {
    setSelectedTypes(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };
  const handleGenerate = async () => {
    // In bulk mode, ensure all students are selected for generation
    if (method === "bulk") {
      setSelectedStudents(students.map(s => s.id));
    }
    const studentCount = method === "bulk" ? students.length : selectedStudents.length;
    const totalQs = loConfigs.reduce((sum, lo) => sum + lo.count, 0);
    toast({
      title: "Generating mock worksheets",
      description: `${studentCount} student(s), ${loConfigs.length} LOs, ~${totalQs} questions/worksheet`
    });
    // Simulate generation
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    setStep(6);
  };
  const Summary = () => <div className="space-y-3 text-sm text-muted-foreground">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">UDISE: {udise}</Badge>
        <Badge variant="outline">Assessment: {assessments.find(a => a.id === selectedAssessment)?.name}</Badge>
        <Badge variant="outline">Students: {method === "bulk" ? students.length : selectedStudents.length}</Badge>
        <Badge variant="outline">LOs: {loConfigs.length}</Badge>
      </div>
    </div>;
  return <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <span>Personalised Worksheet</span>
            <Badge variant="outline">Student-specific</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Create tailored worksheets per student using past assessment performance. This is a mock flow and does not call real APIs yet.
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Step 1: UDISE */}
          {step === 1 && <Section title="Enter School UDISE" description="We will fetch mock school details and students for this UDISE.">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <Label htmlFor="udise">UDISE Code</Label>
                  <Input id="udise" placeholder="e.g. 27010100123" value={udise} onChange={e => setUdise(e.target.value)} />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleFetch} disabled={loading || udise.trim().length < 6}>
                    Fetch Mock Data
                  </Button>
                </div>
              </div>
            </Section>}

          {/* Step 2: School & Students */}
          {step === 2 && <Section title="Review School & Students" description="Verify the mock school details and continue.">
              <div className="rounded-md border p-4 bg-card">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="font-medium text-foreground">{school?.name}</div>
                    <div className="text-sm text-muted-foreground">{school?.address}</div>
                  </div>
                  <Badge variant="secondary">{students.length} students</Badge>
                </div>
              </div>
            </Section>}

          {/* Step 3: Assessment selection */}
          {step === 3 && <Section title="Select Assessment" description="Choose the past assessment to base the personalised worksheets on.">
              <div className="space-y-2">
                <Label>Assessment</Label>
                <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                  <SelectTrigger className="w-full sm:w-[360px]">
                    <SelectValue placeholder="Choose assessment" />
                  </SelectTrigger>
                  {/* Ensure dropdown is opaque and on top */}
                  <SelectContent className="z-50 bg-background">
                    {assessments.map(a => <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </Section>}

          {/* Step 4: Student selection method */}
          {step === 4 && <Section title="Choose Students" description="Pick a method and select the students to include.">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Method</Label>
                  <RadioGroup value={method} onValueChange={v => {
                const next = v as "bulk" | "individual";
                setMethod(next);
                if (next === "bulk") {
                  setSelectedStudents(students.map(s => s.id));
                } else {
                  setSelectedStudents([]);
                }
              }} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bulk" id="bulk" />
                      <Label htmlFor="bulk" className="cursor-pointer">Bulk Generation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="individual" id="individual" />
                      <Label htmlFor="individual" className="cursor-pointer">Individual Selection</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  
                  {method === "individual" ? <div className="grid gap-2 sm:grid-cols-2">
                      {students.map(s => <label key={s.id} className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/40">
                          <Checkbox checked={selectedStudents.includes(s.id)} onCheckedChange={() => toggleStudent(s.id)} />
                          <div className="leading-tight">
                            <div className="text-sm font-medium text-foreground">{s.name}</div>
                            <div className="text-xs text-muted-foreground">Grade {s.grade} • ID {s.id}</div>
                          </div>
                        </label>)}
                    </div> : <div className="rounded-md border p-3 bg-muted/20 text-sm text-muted-foreground">
                      Bulk mode is selected. Worksheets will be generated for all {students.length} students.
                    </div>}
                </div>
              </div>
            </Section>}

          {step === 5 && <Section title="LO-wise Personalised Format" description="Configure question format for selected students. You can use unified settings for all students or customize per student.">
              {selectedStudents.length > 1 && (
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      id="unified" 
                      checked={unifiedFormat} 
                      onCheckedChange={(checked) => setUnifiedFormat(checked as boolean)}
                    />
                    <Label htmlFor="unified" className="cursor-pointer">
                      Use unified format for all {selectedStudents.length} students
                    </Label>
                  </div>
                  {!unifiedFormat && (
                    <div className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-md">
                      <strong>Individual customization:</strong> You can customize LO format for each student separately. 
                      This might take more time but allows for precise personalization.
                    </div>
                  )}
                </div>
              )}

              {unifiedFormat || selectedStudents.length === 1 ? (
                <div className="space-y-4">
                  <div className="text-sm font-medium text-foreground">
                    Format Configuration {selectedStudents.length > 1 && "(Applied to all students)"}
                  </div>
                  <PerLOFormatEditor 
                    loConfigs={loConfigs} 
                    onChange={setLoConfigs} 
                    questionTypeOptions={questionTypeOptions} 
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedStudents.map(studentId => {
                    const student = students.find(s => s.id === studentId)!;
                    const studentConfigs = studentSpecificConfigs[studentId] || loConfigs;
                    
                    return (
                      <div key={studentId} className="border rounded-md p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-foreground">
                            {student.name} - Grade {student.grade}
                          </div>
                          <Badge variant="outline">Individual Format</Badge>
                        </div>
                        <PerLOFormatEditor
                          loConfigs={studentConfigs}
                          onChange={(configs) => {
                            setStudentSpecificConfigs(prev => ({
                              ...prev,
                              [studentId]: configs
                            }));
                          }}
                          questionTypeOptions={questionTypeOptions}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-4">
                <Summary />
              </div>
            </Section>}

          {/* Step 6: Result summary (mock) */}
          {step === 6 && <Section title="Generation Complete (Mock)" description="Worksheets were generated locally in this demo. In production, PDFs will be saved to storage for download and printing.">
              <Summary />
              <div className="mt-4 grid gap-2">
                {selectedStudents.map(id => {
              const st = students.find(s => s.id === id)!;
              return <div key={id} className="flex items-center justify-between rounded-md border p-3">
                      <div className="text-sm">
                        <span className="font-medium text-foreground">{st.name}</span>
                        <span className="text-muted-foreground"> — Grade {st.grade}</span>
                      </div>
                      <Button variant="secondary" disabled title="Mock download disabled">
                        Download PDF (mock)
                      </Button>
                    </div>;
            })}
              </div>
            </Section>}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1 || loading}>
              Back
            </Button>
            {step < 5 && <Button onClick={() => setStep(s => s + 1)} disabled={!canGoNext || loading}>
                Next
              </Button>}
            {step === 5 && <Button onClick={handleGenerate} disabled={!canGoNext || loading}>
                Generate Worksheets (Mock)
              </Button>}
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default PersonalizedWorksheet;