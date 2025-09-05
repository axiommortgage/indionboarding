'use client';

import { useState } from 'react';
import { useForms } from '@/shared/contexts/forms-context';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function TestFormsPage() {
  const { 
    forms, 
    menuOrder, 
    getFormCompletionPercentage, 
    isFormComplete,
    validateForm,
    submitAllForms 
  } = useForms();
  
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const runFormTests = () => {
    const results: Record<string, any> = {};
    
    menuOrder.forEach(menuItem => {
      const formKey = menuItem.key as keyof typeof forms;
      const formData = forms[formKey];
      const validation = validateForm(formKey);
      const isComplete = isFormComplete(formKey);
      
      results[formKey] = {
        title: menuItem.title,
        slug: menuItem.slug,
        hasData: !!formData,
        isComplete,
        validation,
        dataKeys: formData ? Object.keys(formData) : [],
        sampleData: formData ? Object.entries(formData).slice(0, 3) : [],
      };
    });
    
    setTestResults(results);
  };

  const testSubmission = async () => {
    try {
      await submitAllForms();
      console.log('Submission test successful');
    } catch (error) {
      console.error('Submission test failed:', error);
    }
  };

  const completionPercentage = getFormCompletionPercentage();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Forms Testing Dashboard</h1>
          <p className="text-muted-foreground">
            Test and validate all onboarding forms
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            {completionPercentage}% Complete
          </Badge>
          <Button onClick={runFormTests}>
            Run Tests
          </Button>
          <Button onClick={testSubmission} variant="outline">
            Test Submission
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Form Menu Order</CardTitle>
            <CardDescription>
              Current form navigation order ({menuOrder.length} forms)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuOrder.map((item, index) => (
                <div key={item.key} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Badge variant="secondary">{index + 1}</Badge>
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground">/{item.slug}</div>
                  </div>
                  {isFormComplete(item.key as keyof typeof forms) ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {Object.keys(testResults).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Detailed analysis of each form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(testResults).map(([formKey, result]) => (
                  <div key={formKey} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{result.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Key: {formKey} | Slug: /{result.slug}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.hasData ? (
                          <Badge variant="outline" className="text-green-600">
                            Has Data
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600">
                            No Data
                          </Badge>
                        )}
                        {result.isComplete ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">Validation</h4>
                        <p className="text-muted-foreground">
                          Valid: {result.validation.isValid ? 'Yes' : 'No'}
                        </p>
                        {result.validation.fields && (
                          <p className="text-muted-foreground">
                            Fields: {result.validation.fields.length}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Data Keys ({result.dataKeys.length})</h4>
                        <div className="flex flex-wrap gap-1">
                          {result.dataKeys.slice(0, 5).map((key: string) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key}
                            </Badge>
                          ))}
                          {result.dataKeys.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{result.dataKeys.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {result.sampleData.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <h4 className="font-medium mb-2">Sample Data</h4>
                        <div className="space-y-1 text-sm">
                          {result.sampleData.map(([key, value]: [string, any]) => (
                            <div key={key} className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{key}</Badge>
                              <span className="text-muted-foreground truncate">
                                {typeof value === 'string' ? value.slice(0, 50) : JSON.stringify(value).slice(0, 50)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
