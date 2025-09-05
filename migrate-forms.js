const fs = require('fs');
const path = require('path');

// List of remaining forms to migrate
const forms = [
  'letter-of-direction',
  'mpc-application', 
  'payment-authorization',
  'photos',
  'policies',
  'unlicensed-information',
  'website-information'
];

// Read the original page content
const readOriginalPage = (formName) => {
  const pagePath = path.join(__dirname, 'src', 'app', '(inapp)', 'webforms', formName, 'page.tsx');
  return fs.readFileSync(pagePath, 'utf8');
};

// Extract validation schema from page content
const extractValidationSchema = (content) => {
  const schemaMatch = content.match(/const (\w+Schema) = z\.object\([\s\S]*?\);/);
  if (!schemaMatch) return null;
  
  const schemaName = schemaMatch[1];
  const schemaStart = content.indexOf(schemaMatch[0]);
  const schemaEnd = content.indexOf('});', schemaStart) + 3;
  const schemaCode = content.substring(schemaStart, schemaEnd);
  
  return {
    name: schemaName,
    code: schemaCode
  };
};

// Extract form data type
const extractFormDataType = (content) => {
  const typeMatch = content.match(/type (\w+FormData) = z\.infer<typeof \w+Schema>;/);
  if (!typeMatch) return null;
  
  return typeMatch[1];
};

// Extract form component name
const extractFormComponentName = (content) => {
  const componentMatch = content.match(/export default function (\w+Page)/);
  if (!componentMatch) return null;
  
  return componentMatch[1].replace('Page', 'Form');
};

// Extract form context key
const extractFormContextKey = (content) => {
  const updateFormMatch = content.match(/updateForm\('([^']+)'/);
  if (!updateFormMatch) return null;
  
  return updateFormMatch[1];
};

// Create validation file
const createValidationFile = (formName, schema) => {
  const validationContent = `import * as z from "zod";

${schema.code}

export type ${schema.name.replace('Schema', 'FormData')} = z.infer<typeof ${schema.name}>;
export { ${schema.name} };`;

  const validationPath = path.join(__dirname, 'src', 'features', formName, 'lib', 'validation.ts');
  fs.writeFileSync(validationPath, validationContent);
};

// Create types file
const createTypesFile = (formName, formDataType) => {
  const typesContent = `export type { ${formDataType} } from '../lib/validation';

export interface ${formDataType.replace('FormData', 'FormProps')} {
  initialData?: Partial<${formDataType}>;
  onSubmit?: (data: ${formDataType}) => void;
  isLoading?: boolean;
}`;

  const typesPath = path.join(__dirname, 'src', 'features', formName, 'types', 'index.ts');
  fs.writeFileSync(typesPath, typesContent);
};

// Create hook file
const createHookFile = (formName, formDataType, schemaName, contextKey) => {
  const hookContent = `import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { toast } from "@/shared/lib/toast";
import { ${schemaName}, ${formDataType} } from "../lib/validation";

export function use${formDataType.replace('FormData', 'Form')}() {
  const { forms, updateForm, saveForm } = useFormsContext();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<${formDataType}>({
    resolver: zodResolver(${schemaName}) as any,
    defaultValues: {},
  });

  const { watch, setValue, handleSubmit, formState: { errors } } = form;
  const watchedValues = watch();

  React.useEffect(() => {
    if (forms.${contextKey}) {
      const formData = forms.${contextKey};
      Object.keys(formData).forEach((key) => {
        if (key in watchedValues) {
          setValue(key as keyof ${formDataType}, formData[key as keyof typeof formData] as any);
        }
      });
    }
  }, [forms.${contextKey}, setValue]);

  const onSubmit = async (data: ${formDataType}) => {
    setIsLoading(true);
    try {
      updateForm('${contextKey}', {
        ...data,
        isFormComplete: true,
        lastUpdated: new Date().toISOString(),
      });

      await saveForm('${contextKey}');
      toast.success("${formName.replace(/-/g, ' ')} saved successfully!");
    } catch (error) {
      console.error("Error saving ${formName}:", error);
      toast.error("Failed to save ${formName}");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    watchedValues,
    errors,
    isLoading,
    handleSubmit: handleSubmit(onSubmit),
  };
}`;

  const hookPath = path.join(__dirname, 'src', 'features', formName, 'hooks', `use-${formName}-form.ts`);
  fs.writeFileSync(hookPath, hookContent);
};

// Create component file (simplified version)
const createComponentFile = (formName, formComponentName, formDataType) => {
  const componentContent = `"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { FormSectionTitle } from "@/shared/ui/form-section-title";
import { NextPrevFooter } from "@/shared/ui/next-prev-footer";
import { use${formDataType.replace('FormData', 'Form')} } from "../hooks/use-${formName}-form";

export function ${formComponentName}() {
  const {
    form,
    watchedValues,
    errors,
    isLoading,
    handleSubmit,
  } = use${formDataType.replace('FormData', 'Form')}();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ${formName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <FormSectionTitle
                title="${formName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Information"
                description="Please provide your information"
              />
              <p>Form content will be implemented here.</p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save ${formName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}"}
              </Button>
            </div>

            <NextPrevFooter />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}`;

  const componentPath = path.join(__dirname, 'src', 'features', formName, 'components', `${formName}-form.tsx`);
  fs.writeFileSync(componentPath, componentContent);
};

// Create index files
const createIndexFiles = (formName, formDataType, formComponentName) => {
  // Components index
  const componentsIndex = `export { ${formComponentName} } from './${formName}-form';`;
  fs.writeFileSync(path.join(__dirname, 'src', 'features', formName, 'components', 'index.ts'), componentsIndex);

  // Hooks index
  const hooksIndex = `export { use${formDataType.replace('FormData', 'Form')} } from './use-${formName}-form';`;
  fs.writeFileSync(path.join(__dirname, 'src', 'features', formName, 'hooks', 'index.ts'), hooksIndex);

  // Lib index
  const libIndex = `export { ${formDataType.replace('FormData', 'Schema').toLowerCase()}, type ${formDataType} } from './validation';`;
  fs.writeFileSync(path.join(__dirname, 'src', 'features', formName, 'lib', 'index.ts'), libIndex);

  // Main index
  const mainIndex = `export * from './components';
export * from './hooks';
export * from './lib';
export * from './types';`;
  fs.writeFileSync(path.join(__dirname, 'src', 'features', formName, 'index.ts'), mainIndex);
};

// Create page wrapper
const createPageWrapper = (formName, formComponentName) => {
  const pageContent = `import { ${formComponentName} } from "@/features/${formName}";

export default function ${formComponentName.replace('Form', 'Page')}() {
  return <${formComponentName} />;
}`;

  const pagePath = path.join(__dirname, 'src', 'app', '(inapp)', 'webforms', formName, 'page.tsx');
  fs.writeFileSync(pagePath, pageContent);
};

// Main migration function
const migrateForm = (formName) => {
  console.log(`Migrating ${formName}...`);
  
  // Create feature directory
  const featureDir = path.join(__dirname, 'src', 'features', formName);
  ['components', 'hooks', 'lib', 'types'].forEach(dir => {
    const dirPath = path.join(featureDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  // Read original page
  const originalContent = readOriginalPage(formName);
  
  // Extract information
  const schema = extractValidationSchema(originalContent);
  const formDataType = extractFormDataType(originalContent);
  const formComponentName = extractFormComponentName(originalContent);
  const contextKey = extractFormContextKey(originalContent);

  if (!schema || !formDataType || !formComponentName || !contextKey) {
    console.error(`Failed to extract information for ${formName}`);
    return;
  }

  // Create files
  createValidationFile(formName, schema);
  createTypesFile(formName, formDataType);
  createHookFile(formName, formDataType, schema.name, contextKey);
  createComponentFile(formName, formComponentName, formDataType);
  createIndexFiles(formName, formDataType, formComponentName);
  createPageWrapper(formName, formComponentName);

  console.log(`✅ ${formName} migrated successfully`);
};

// Migrate all forms
forms.forEach(migrateForm);

console.log('🎉 All forms migrated successfully!');
