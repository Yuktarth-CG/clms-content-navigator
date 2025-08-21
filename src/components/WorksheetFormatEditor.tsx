import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type QuestionTypeOption = "MCQ" | "ShortAnswer" | "LongAnswer";

export type DifficultySystem = "traditional" | "bloom";

export type WorksheetFormat = {
  questionsPerLO: number;
  allowedQuestionTypes: QuestionTypeOption[];
  difficultySystem: DifficultySystem;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
};

interface Props {
  format: WorksheetFormat;
  onChange: (format: WorksheetFormat) => void;
  questionTypeOptions: { key: QuestionTypeOption; label: string }[];
  totalLOs: number;
}

const WorksheetFormatEditor: React.FC<Props> = ({ 
  format, 
  onChange, 
  questionTypeOptions, 
  totalLOs 
}) => {
  const getDifficultyLabels = () => {
    if (format.difficultySystem === "bloom") {
      return { easy: "LOTS", medium: "MOTS", hard: "HOTS" };
    }
    return { easy: "Easy", medium: "Medium", hard: "Hard" };
  };

  const getDifficultyDescriptions = () => {
    if (format.difficultySystem === "bloom") {
      return { 
        easy: "Lower Order Thinking Skills (Knowledge, Comprehension)",
        medium: "Middle Order Thinking Skills (Application, Analysis)", 
        hard: "Higher Order Thinking Skills (Synthesis, Evaluation)"
      };
    }
    return { 
      easy: "Basic level questions with simple recall",
      medium: "Moderate difficulty requiring understanding", 
      hard: "Challenging questions requiring analysis"
    };
  };
  const toggleQuestionType = (type: QuestionTypeOption) => {
    const newTypes = format.allowedQuestionTypes.includes(type)
      ? format.allowedQuestionTypes.filter(t => t !== type)
      : [...format.allowedQuestionTypes, type];
    
    onChange({
      ...format,
      allowedQuestionTypes: newTypes
    });
  };

  const updateQuestionsPerLO = (value: number) => {
    onChange({
      ...format,
      questionsPerLO: Math.max(1, value)
    });
  };

  const updateDifficultyDistribution = (difficulty: keyof WorksheetFormat['difficultyDistribution'], value: number) => {
    const newDistribution = { ...format.difficultyDistribution };
    newDistribution[difficulty] = value;
    
    // Ensure total equals 100%
    const total = Object.values(newDistribution).reduce((sum, val) => sum + val, 0);
    if (total > 100) {
      // Proportionally adjust other values
      const otherKeys = Object.keys(newDistribution).filter(k => k !== difficulty) as Array<keyof typeof newDistribution>;
      const remaining = 100 - value;
      const otherTotal = otherKeys.reduce((sum, key) => sum + newDistribution[key], 0);
      
      if (otherTotal > 0) {
        otherKeys.forEach(key => {
          newDistribution[key] = Math.round((newDistribution[key] / otherTotal) * remaining);
        });
      } else {
        // If other values are 0, distribute equally
        const perOther = Math.floor(remaining / otherKeys.length);
        otherKeys.forEach((key, index) => {
          newDistribution[key] = index === 0 ? remaining - (perOther * (otherKeys.length - 1)) : perOther;
        });
      }
    }

    onChange({
      ...format,
      difficultyDistribution: newDistribution
    });
  };

  const totalQuestions = format.questionsPerLO * totalLOs;
  const difficultyTotal = Object.values(format.difficultyDistribution).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Worksheet Format Configuration</CardTitle>
          <p className="text-sm text-muted-foreground">
            Define the overall format that will be applied to all Learning Objectives in the worksheet.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Questions per LO */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Questions per Learning Objective</Label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min={1}
                max={20}
                value={format.questionsPerLO}
                onChange={(e) => updateQuestionsPerLO(Number(e.target.value || 1))}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">
                Total questions: {totalQuestions} ({totalLOs} LOs × {format.questionsPerLO} questions each)
              </span>
            </div>
          </div>

          {/* Question Types */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Allowed Question Types</Label>
            <p className="text-sm text-muted-foreground">
              Select which question types can be included in the worksheet. Questions will be distributed across these types.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {questionTypeOptions.map((option) => (
                <label
                  key={option.key}
                  className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/40"
                >
                  <Checkbox
                    checked={format.allowedQuestionTypes.includes(option.key)}
                    onCheckedChange={() => toggleQuestionType(option.key)}
                  />
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Difficulty System Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Difficulty System</Label>
            <p className="text-sm text-muted-foreground">
              Choose how you want to categorize question difficulty levels.
            </p>
            <RadioGroup 
              value={format.difficultySystem} 
              onValueChange={(value: DifficultySystem) => onChange({
                ...format,
                difficultySystem: value
              })}
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/20">
                <RadioGroupItem value="traditional" id="traditional" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="traditional" className="font-medium cursor-pointer">Traditional (Easy, Medium, Hard)</Label>
                  <p className="text-sm text-muted-foreground">Simple difficulty levels based on complexity</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/20">
                <RadioGroupItem value="bloom" id="bloom" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="bloom" className="font-medium cursor-pointer">Bloom's Taxonomy (LOTS, MOTS, HOTS)</Label>
                  <p className="text-sm text-muted-foreground">Based on cognitive thinking levels and learning objectives</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Difficulty Distribution */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Difficulty Distribution</Label>
            <p className="text-sm text-muted-foreground">
              Set the percentage of questions for each difficulty level across all LOs.
            </p>
            
            <div className="space-y-4">
              {Object.entries(format.difficultyDistribution).map(([difficulty, percentage]) => {
                const labels = getDifficultyLabels();
                const descriptions = getDifficultyDescriptions();
                const diffKey = difficulty as keyof typeof labels;
                
                return (
                  <div key={difficulty} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">{labels[diffKey]}</Label>
                        <p className="text-xs text-muted-foreground">{descriptions[diffKey]}</p>
                      </div>
                      <span className="text-sm font-medium">{percentage}%</span>
                    </div>
                    <Slider
                      value={[percentage]}
                      onValueChange={(value) => updateDifficultyDistribution(
                        difficulty as keyof WorksheetFormat['difficultyDistribution'], 
                        value[0]
                      )}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                );
              })}
              
              <div className="text-xs text-muted-foreground">
                Total: {difficultyTotal}% {difficultyTotal !== 100 && "(should equal 100%)"}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/20 rounded-md p-4 space-y-2">
            <div className="text-sm font-medium">Worksheet Summary:</div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• {totalQuestions} total questions across {totalLOs} Learning Objectives</div>
              <div>• {format.questionsPerLO} questions per LO</div>
              <div>• Question types: {format.allowedQuestionTypes.join(", ") || "None selected"}</div>
              <div>• Difficulty ({format.difficultySystem === "bloom" ? "Bloom's Taxonomy" : "Traditional"}): {format.difficultyDistribution.easy}% {getDifficultyLabels().easy}, {format.difficultyDistribution.medium}% {getDifficultyLabels().medium}, {format.difficultyDistribution.hard}% {getDifficultyLabels().hard}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorksheetFormatEditor;