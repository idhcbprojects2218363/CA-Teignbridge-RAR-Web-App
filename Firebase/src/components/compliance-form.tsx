
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formSchema, type FormSchema } from "@/lib/form-schema";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import React from "react";
import { handleComplianceCheck } from "@/app/actions";
import {
  User,
  Mail,
  Phone,
  Laptop,
  Smartphone,
  AlertTriangle,
  ChevronRight,
  Info,
  Trash2,
  LogOut,
  Check
} from "lucide-react";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { Switch } from "./ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Script from "next/script";

declare global {
  interface Window {
    onRecaptchaLoad: () => void;
    grecaptcha: {
      render: (container: string | HTMLElement, parameters: {
        sitekey: string;
        callback: (token: string) => void;
      }) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

const totalSteps = 6;
const LOCAL_STORAGE_KEY = 'complianceFormData';


const MandatoryLabel = ({ children }: { children: React.ReactNode }) => (
  <FormLabel className="font-bold">
    {children} <span className="text-destructive dark:text-yellow-400 [.high-contrast_&]:text-primary">*</span>
  </FormLabel>
);

const defaultFormValues: Partial<FormSchema> = {
  Full_Name: "",
  Contact_Email: "",
  Receive_Copy: false,
  Contact_Number: "",
  Preferred_Contact_Method: undefined,
  Reason_for_BYOD: "",
  Device_Type: undefined,
  Device_Count: 1,
  Device_Model_Name: "",
  OS_and_Version: "",
  Web_Browser_and_Version: "",
  Malware_Protection_Software: "",
  Email_Client_Used: "",
  Office_Apps_Used: "",
  Other_Cloud_Services: "",
  MFA_On_Cloud_Services: undefined,
  Software_Firewall_Assurance: undefined,
  Uninstall_Unused_Apps: undefined,
  Remove_Unused_Accounts: undefined,
  Strong_Passwords_MFA_Assurance: undefined,
  Device_Lock_Assurance: undefined,
  Separate_User_Account_Assurance: undefined,
  Official_App_Stores_Assurance: undefined,
  AutoRun_Disabled_Assurance: undefined,
  Update_Devices: undefined,
  Supported_Licensed: undefined,
  In_Scope: undefined,
  Automatic_Updates: undefined,
  Anti_Malware_All: undefined,
  Antimalware_Updates: undefined,
  Antimalware_Scans: undefined,
  Antimalware_Web_Protection: undefined,
  Personalised_Help: undefined,
  Comments_Feedback: "",
  Acknowledge_Policy_Compliance: false,
  Acknowledge_Security_Risks: false,
  Acknowledge_Security_Measures: false,
  IP_Address: "...",
  userAgent: "",
  Fax: "",
  recaptchaToken: "",
};

export default function ComplianceForm() {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [clientLoaded, setClientLoaded] = React.useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = React.useState(false);
  const recaptchaWidgetRef = React.useRef<string | null>(null);
  const recaptchaContainerRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [submissionTime, setSubmissionTime] = React.useState<Date | null>(null);
  const [isPrivacyBannerVisible, setPrivacyBannerVisible] = React.useState(true);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
    mode: "onChange",
  });

  const onRecaptchaSuccess = (token: string) => {
    form.setValue("recaptchaToken", token, { shouldValidate: true });
  };

  React.useEffect(() => {
    window.onRecaptchaLoad = () => {
      setRecaptchaLoaded(true);
    };

    return () => {
      // @ts-ignore
      delete window.onRecaptchaLoad;
    };
  }, []);

  React.useEffect(() => {
    if (recaptchaLoaded && recaptchaContainerRef.current && currentStep === 7) {
      if (recaptchaWidgetRef.current === null) {
        recaptchaWidgetRef.current = window.grecaptcha.render(recaptchaContainerRef.current, {
          'sitekey': process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!,
          'callback': onRecaptchaSuccess,
        });
      }
    }
  }, [recaptchaLoaded, currentStep]);


  const populateBrowserData = React.useCallback(() => {
    if (typeof window !== "undefined") {
      const userAgent = navigator.userAgent;
      form.setValue("userAgent", userAgent);
      
      const osMatch = userAgent.match(/\(([^)]+)\)/);
      const osInfo = osMatch ? osMatch[1].split(';')[0] : 'Unknown OS';
      form.setValue("OS_and_Version", osInfo.trim());
      
      const parts = userAgent.split(' ');
      const browserInfo = parts.find(p => p.includes('Chrome/') || p.includes('Firefox/') || p.includes('Safari/')) || userAgent;
      form.setValue("Web_Browser_and_Version", browserInfo);
    }
  }, [form]);

    const clearForm = React.useCallback((showToast = false) => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
        form.reset(defaultFormValues);
        setCurrentStep(1);
        if (recaptchaLoaded && recaptchaWidgetRef.current !== null) {
            window.grecaptcha.reset(recaptchaWidgetRef.current);
        }
        setPrivacyBannerVisible(true);
        recaptchaWidgetRef.current = null; // Ensure widget ref is cleared
        populateBrowserData(); 
        if (showToast) {
            toast({
                title: "Form Cleared",
                description: "Your saved progress has been deleted.",
            });
        }
    }, [form, populateBrowserData, toast, recaptchaLoaded]);


  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          delete parsedData.Acknowledge_Policy_Compliance;
          delete parsedData.Acknowledge_Security_Risks;
          delete parsedData.Acknowledge_Security_Measures;
          delete parsedData.recaptchaToken;
          form.reset(parsedData);
        } catch (e) {
          console.error("Failed to parse saved form data:", e);
          clearForm(false);
        }
      } else {
        populateBrowserData();
      }
    }
    setClientLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    // This effect runs when the component mounts and ensures the form is clean,
    // which is important when navigating back from the "thank you" page.
    clearForm(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const subscription = form.watch((value) => {
       if (typeof window !== 'undefined' && currentStep <= totalSteps) {
         localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
       }
    });
    return () => subscription.unsubscribe();
  }, [form, currentStep]);


  React.useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        form.setValue("IP_Address", data.ip);
      } catch (error) {
        console.error("Failed to fetch IP address", error);
        form.setValue("IP_Address", "Unavailable");
      }
    };
    
    fetchIp();
  }, [form]);

  const watchedDeviceCount = form.watch("Device_Count");
  const contactEmail = form.watch("Contact_Email");
  const contactNumber = form.watch("Contact_Number");
  const recaptchaToken = form.watch("recaptchaToken");

  type FieldName = keyof FormSchema;

  const personalFields: FieldName[] = ["Full_Name", "Contact_Email", "Receive_Copy", "Contact_Number", "Preferred_Contact_Method"];
  const deviceFields: FieldName[] = ["Reason_for_BYOD", "Device_Type", "Device_Count", "Device_Model_Name", "OS_and_Version", "Web_Browser_and_Version"];
  const softwareFields: FieldName[] = ["Malware_Protection_Software", "Email_Client_Used", "Office_Apps_Used", "Other_Cloud_Services", "MFA_On_Cloud_Services"];
  const securityFields: FieldName[] = [
    "Software_Firewall_Assurance", "Uninstall_Unused_Apps", "Remove_Unused_Accounts",
    "Strong_Passwords_MFA_Assurance", "Device_Lock_Assurance", "Separate_User_Account_Assurance",
    "Official_App_Stores_Assurance", "AutoRun_Disabled_Assurance",
  ];
  const updateFields: FieldName[] = [
    "Update_Devices", "Supported_Licensed", "In_Scope", "Automatic_Updates", "Anti_Malware_All",
    "Antimalware_Updates", "Antimalware_Scans", "Antimalware_Web_Protection"
  ];
  const finalFields: FieldName[] = [
    "Personalised_Help", 
    "Comments_Feedback",
    "Acknowledge_Policy_Compliance", 
    "Acknowledge_Security_Risks", 
    "Acknowledge_Security_Measures"
  ];


  const nextStep = async () => {
    let fieldsToValidate: FieldName[] = [];
    if (currentStep === 1) fieldsToValidate = personalFields;
    if (currentStep === 2) fieldsToValidate = deviceFields;
    if (currentStep === 3) fieldsToValidate = softwareFields;
    if (currentStep === 4) fieldsToValidate = securityFields;
    if (currentStep === 5) fieldsToValidate = updateFields;
    
    if (currentStep === totalSteps) {
      const isValid = await form.trigger(finalFields);
      if (isValid) {
        setCurrentStep((prev) => prev + 1);
      }
      return; 
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      if (watchedDeviceCount > 1 && currentStep === 2) {
        toast({
          variant: "destructive",
          title: "Multiple Devices Detected",
          description: "Please submit a separate application for each device. Change the device count to 1 to continue.",
        });
        return;
      }
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const prevStep = () => {
     if (currentStep > 1) {
        setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (data: FormSchema) => {
    setIsLoading(true);
    setSubmissionTime(new Date());
    
    const result = await handleComplianceCheck(data);
    
    if (result.success && result.data?.submissionId) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
      router.push(`/assessment?submissionId=${result.data.submissionId}`);
    } else {
      const errorMessage = result.error || "An unknown error occurred.";
      // URL-encode the error message to handle special characters
      router.push(`/assessment?error=${encodeURIComponent(errorMessage)}`);
    }

    // Don't set loading to false here, as we are navigating away.
  };


  const stepDescriptions: { [key: number]: string } = {
    1: "Your Details",
    2: "Your Device",
    3: "Software Setup",
    4: "Security Assurances",
    5: "Updates & Anti-Malware",
    6: "Final Thoughts & Consent",
    7: "Submit"
  };

  const renderRadioGroup = (name: FieldName, options: string[], disabled = false) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={String(field.value ?? "")}
              className={`grid grid-cols-2 md:grid-cols-4 gap-2`}
              disabled={disabled}
            >
              {options.map((option) => (
                <FormItem key={option}>
                  <FormControl>
                    <RadioGroupItem value={option} id={`${name.toString()}-${option}`} className="peer sr-only" />
                  </FormControl>
                  <FormLabel htmlFor={`${name.toString()}-${option}`} className={cn(
                    "block w-full cursor-pointer rounded-custom border-2 border-primary bg-transparent p-3 text-center text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-ring",
                    disabled && "cursor-not-allowed opacity-50 bg-muted hover:bg-muted peer-data-[state=checked]:bg-muted peer-data-[state=checked]:text-muted-foreground"
                    )}>
                    {option}
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
  
  const now = new Date();

  if (!clientLoaded) {
    return (
       <Card className="w-full">
        <CardHeader>
           <div className="h-8 w-1/2 bg-muted rounded-md animate-pulse"></div>
           <div className="h-4 w-full bg-muted rounded-md animate-pulse mt-2"></div>
        </CardHeader>
        <CardContent>
            <div className="h-48 w-full bg-muted rounded-md animate-pulse"></div>
        </CardContent>
        <CardFooter className="flex justify-between">
            <div className="h-10 w-24 bg-muted rounded-md animate-pulse"></div>
            <div className="h-10 w-24 bg-muted rounded-md animate-pulse"></div>
        </CardFooter>
      </Card>
    );
  }


  return (
    <>
      <Script
        src="https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit"
        async
        defer
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-lg">
                  <span className="font-bold text-foreground">Step {Math.min(currentStep, totalSteps + 1)} of {totalSteps + 1}</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  <span className="font-bold text-primary">{stepDescriptions[currentStep]}</span>
                </div>
<<<<<<< Updated upstream
                <Button type="button" variant="outline" size="sm" onClick={() => clearForm(true)}>
=======
                <Button variant="outline" size="sm" onClick={() => clearForm(true)}>
>>>>>>> Stashed changes
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Form
                </Button>
              </div>
              <Progress value={(currentStep / (totalSteps + 1)) * 100} className="mt-2" />

              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Your Progress is Saved!</AlertTitle>
                <AlertDescription>
                  Your form is automatically saved in your browser as you fill it out. You can safely close this page and come back later to complete it.
                </AlertDescription>
              </Alert>

              <div className="mt-4 space-y-4 rounded-lg border bg-muted/30 p-4 dark:bg-muted/50">
                <h3 className="font-semibold text-muted-foreground">Submission Details (For IT Use):</h3>
                <Separator />
                {clientLoaded && (
                  <div className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm md:grid-cols-2">
                      <div>
                          <span className="font-bold">Current Date and time (submission):</span>
                          <p>{format(submissionTime || now, 'dd/MM/yyyy HH:mm')}</p>
                      </div>
                      <div>
                          <span className="font-bold">Initial Response No Later Than:</span>
                          <p className="font-bold text-destructive dark:font-medium dark:text-yellow-400 [.high-contrast_&]:text-primary">{format(new Date((submissionTime || now).getTime() + 7 * 24 * 60 * 60 * 1000), 'dd/MM/yyyy HH:mm')}</p>
                      </div>
                  </div>
                )}
              </div>
              
              {(currentStep === 2 || currentStep === 3) && (
                <p className="pt-4 text-sm text-foreground">If a question does not apply please type none or N/A.</p>
              )}
              {(currentStep === 4 || currentStep === 5) && (
                <div className="pt-4 space-y-2">
                  <p className="text-sm text-foreground">
                    Please indicate your willingness to cooperate on the following security areas. Please select 'Yes' or 'No' for each point.
                  </p>
                  <div className="flex items-start gap-x-2 rounded-md border border-red-700 bg-yellow-400 p-3 text-sm text-red-800">
                      <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-700" />
                      <p>
                        <strong className="font-bold">Important:</strong> You are within your right to answer No or N/A but doing so may cause the approval of your application to be delayed.
                      </p>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              
              <FormField
                control={form.control}
                name="Fax"
                render={({ field }) => (
                  <FormItem className="absolute left-[-5000px]">
                    <FormLabel>Fax</FormLabel>
                    <FormControl>
                      <Input {...field} tabIndex={-1} autoComplete="off" />
                    </FormControl>
                  </FormItem>
                )}
              />

              {currentStep === 1 && (
                <div className="space-y-4">
                  <FormField control={form.control} name="Full_Name" render={({ field }) => (
                    <FormItem>
                      <MandatoryLabel>Full Name</MandatoryLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="John Doe" {...field} className="pl-10"/>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="Contact_Email" render={({ field }) => (
                    <FormItem>
                      <MandatoryLabel>Contact Email</MandatoryLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="email" placeholder="personal@example.com" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField
                    control={form.control}
                    name="Receive_Copy"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-bold">
                            Do you wish to recieve a copy of your submission?
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField control={form.control} name="Contact_Number" render={({ field }) => (
                    <FormItem>
                      <MandatoryLabel>Contact Number</MandatoryLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="e.g., 07123 456789" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="Preferred_Contact_Method" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <MandatoryLabel>Preferred Contact Method</MandatoryLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {[
                            { value: "Contact_Email", label: `Contact Email ${contactEmail ? `(${contactEmail})` : ''}` },
                            { value: "Contact_Number", label: `Contact Number ${contactNumber ? `(${contactNumber})` : ''}` }
                          ].map(option => (
                            <FormItem key={option.value}>
                              <FormControl>
                                <RadioGroupItem value={option.value} id={`preferred-${option.value}`} className="peer sr-only"/>
                              </FormControl>
                              <FormLabel htmlFor={`preferred-${option.value}`} className="block w-full cursor-pointer rounded-custom border-2 border-primary bg-transparent p-3 text-center text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-ring">
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="space-y-4">
                  <FormField control={form.control} name="Reason_for_BYOD" render={({ field }) => (
                    <FormItem>
                      <MandatoryLabel>Reason for using personal device</MandatoryLabel>
                      <FormControl>
                        <Textarea placeholder="Describe why you need to use your personal device for work..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="Device_Type" render={({ field }) => (
                    <FormItem>
                      <MandatoryLabel>Device Type</MandatoryLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a device type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mobile devices (smartphone, tablet or hybrid)">
                            <div className="flex items-center gap-2">
                              <Smartphone className="h-4 w-4"/> Mobile (Smartphone, Tablet)
                            </div>
                          </SelectItem>
                          <SelectItem value="computer (desktop or laptop)">
                            <div className="flex items-center gap-2">
                              <Laptop className="h-4 w-4"/> Computer (Desktop, Laptop)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="Device_Count" render={({ field }) => (
                    <FormItem>
                      <MandatoryLabel>Number of Devices</MandatoryLabel>
                      <FormControl>
                        <Input type="number" placeholder="1" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                      </FormControl>
                      {watchedDeviceCount > 1 && (
                          <div className="flex items-start gap-x-2 rounded-md border border-red-700 bg-yellow-400 p-3 text-sm text-red-800">
                              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-700" />
                              <p>You are planning to use two or more devices. Please change this value back to one and submit separate applications for each device.</p>
                          </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="Device_Model_Name" render={({ field }) => (
                    <FormItem>
                      <MandatoryLabel>Device Model Name</MandatoryLabel>
                      <FormControl>
                        <Input placeholder="e.g., iPhone 15 Pro, Dell XPS 15" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="OS_and_Version" render={({ field }) => (
                    <FormItem>
                      <MandatoryLabel>Operating System and Version</MandatoryLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Need help finding the full version?{' '}
                        <a href="https://ce-knowledge-hub.iasme.co.uk/space/CEKH/2834563080/Operating+System+Support" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                          Click here for instructions.
                        </a>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="Web_Browser_and_Version" render={({ field }) => (
                    <FormItem>
                      <MandatoryLabel>Web Browser and Version</MandatoryLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Pre-filled from browser data. Please verify and correct if needed. Need help finding the Version?{' '}
                        <a href="https://www.whatismybrowser.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                          Click here
                        </a>.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}

              {currentStep === 3 && (
                  <div className="space-y-4">
                      <FormField control={form.control} name="Malware_Protection_Software" render={({ field }) => (
                          <FormItem>
                              <MandatoryLabel>Malware Protection Software</MandatoryLabel>
                              <FormControl><Input placeholder="e.g., Windows Defender, Avast" {...field} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />
                      <FormField control={form.control} name="Email_Client_Used" render={({ field }) => (
                          <FormItem>
                              <MandatoryLabel>Email Client Used</MandatoryLabel>
                              <FormControl><Input placeholder="e.g., Outlook, Gmail App" {...field} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />
                      <FormField control={form.control} name="Office_Apps_Used" render={({ field }) => (
                          <FormItem>
                              <MandatoryLabel>Office Apps Used</MandatoryLabel>
                              <FormControl><Input placeholder="e.g., Microsoft 365, Google Workspace" {...field} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />
                      <Separator className="my-6" />

                      <div className="space-y-2">
                        <p className="text-sm text-foreground">
                            The following questions concern other cloud services you might use for your work at LCA Teignbridge, (e.g. something you use daily, you might not think of as being a cloud service). This helps the IT Manager understand what other services may need security considerations. This is because all cloud services must be enabled with MFA (e.g. using Okta Verify for Casebook/Skillbook), and if MFA cannot be enabled, then alternative configurations must be implemented.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Known services like Google Workspace, Okta, Casebook, 3CX, and BreatheHR do not need to be listed.
                        </p>
                      </div>

                      <FormField control={form.control} name="Other_Cloud_Services" render={({ field }) => (
                          <FormItem>
                              <FormLabel className="font-bold">Please list any other cloud-based services you use for your duties at LCA Teignbridge.</FormLabel>
                              <FormControl>
                                  <Textarea placeholder="e.g., Accounting - QuickBooks Online, Sage Business Cloud" {...field} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />

                      <FormField
                          control={form.control}
                          name="MFA_On_Cloud_Services"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel className="font-bold">Are you able to secure these accounts with Multi-Factor Authentication (MFA)?</FormLabel>
                                  <FormControl>
                                      <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                          <FormItem>
                                              <FormControl><RadioGroupItem value="Yes" id="mfa-yes" className="peer sr-only" /></FormControl>
                                              <FormLabel htmlFor="mfa-yes" className="block w-full cursor-pointer rounded-custom border-2 border-primary bg-transparent p-3 text-center text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-ring">Yes</FormLabel>
                                          </FormItem>
                                          <FormItem>
                                              <FormControl><RadioGroupItem value="No" id="mfa-no" className="peer sr-only" /></FormControl>
                                              <FormLabel htmlFor="mfa-no" className="block w-full cursor-pointer rounded-custom border-2 border-primary bg-transparent p-3 text-center text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-ring">No</FormLabel>
                                          </FormItem>
                                          <FormItem>
                                              <FormControl><RadioGroupItem value="I dont know / unknown" id="mfa-unknown" className="peer sr-only" /></FormControl>
                                              <FormLabel htmlFor="mfa-unknown" className="block w-full cursor-pointer rounded-custom border-2 border-primary bg-transparent p-3 text-center text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-ring">I don't know / unknown</FormLabel>
                                          </FormItem>
                                      </RadioGroup>
                                  </FormControl>
                                  <FormDescription>
                                    If not, or if you need help, the IT Manager will discuss this with you. Consider booking a one-to-one appointment on the final step.
                                  </FormDescription>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />

                  </div>
              )}
              
              {currentStep === 4 && (
                  <div className="space-y-6">
                      <div>
                          <h3 className="font-semibold text-lg mb-4 text-primary">Security measures - guarantees "Assurances"</h3>
                          <div className="grid grid-cols-1 gap-6">
                              <FormItem>
                                  <MandatoryLabel>If you can, you will provide an assurance guarantee that you have not disabled your software firewall</MandatoryLabel>
                                  {renderRadioGroup("Software_Firewall_Assurance", ["Yes", "No", "N/A", "I dont know / unknown"])}
                              </FormItem>
                              <FormItem> <MandatoryLabel>If you can, you will provide an assurance guarantee that once you no longer need an App or Software, you uninstall it from your device</MandatoryLabel> {renderRadioGroup("Uninstall_Unused_Apps", ["Yes", "No", "I dont know / unknown"])} </FormItem>
                              <FormItem> <MandatoryLabel>If you can, you will provide an assurance guarantee that you only have the accounts you need on your device and no more. Any accounts which are no longer used should ideally be removed from the device</MandatoryLabel> {renderRadioGroup("Remove_Unused_Accounts", ["Yes", "No", "I dont know / unknown"])} </FormItem>
                              <FormItem> <MandatoryLabel>If you can, you will provide an assurance guarantee that on your device (e.g. mobile devices) or user accounts (e.g. computer) are protected using "strong passwords (possibly 12 characters long), 6-digit pin, MFA", or other appropriate alternatives</MandatoryLabel> {renderRadioGroup("Strong_Passwords_MFA_Assurance", ["Yes", "No", "I dont know / unknown"])} </FormItem>
                              <FormItem> <MandatoryLabel>If you can, you will provide an assurance guarantee that your device locks when left idle for long enough, may run a screen saver, and requires a password, pin or biometric to unlock</MandatoryLabel> {renderRadioGroup("Device_Lock_Assurance", ["Yes", "No", "I dont know / unknown"])} </FormItem>
                              <FormItem> <MandatoryLabel>If you can, you will provide an assurance guarantee that you will create a separate user account or profile on your device for LCA Teignbridge work (keeps your personal information private and isolated)</MandatoryLabel> {renderRadioGroup("Separate_User_Account_Assurance", ["Yes", "No", "N/A", "I dont know / unknown"])} </FormItem>
                              <FormItem> <MandatoryLabel>You will only install apps from official trusted app stores (e.g., Google Play Store, Apple App Store)</MandatoryLabel> {renderRadioGroup("Official_App_Stores_Assurance", ["Yes", "No", "I dont know / unknown"])} </FormItem>
                              <FormItem> <MandatoryLabel>You will have disable any auto-run/auto-play features that allow files to execute without explicit authorization (e.g. you get a popup asking what to do next) typically seen when you connect up a USB memory stick or DVD.</MandatoryLabel> {renderRadioGroup("AutoRun_Disabled_Assurance", ["Yes", "No", "N/A", "I dont know / unknown"])} </FormItem>
                          </div>
                      </div>
                  </div>
              )}

              {currentStep === 5 && (
                  <div className="space-y-6">
                      <div>
                          <h3 className="font-semibold text-lg mb-4 text-primary">Updates and Unsupported (OS, Software, Apps, etc.) - guarantees "Assurances"</h3>
                          <div className="grid grid-cols-1 gap-6">
                              <FormItem> <MandatoryLabel>If you can, you will provide an assurance guarantee that you update your devices you use to do work for LCA Teignbrige</MandatoryLabel> {renderRadioGroup("Update_Devices", ["Yes", "No", "I dont know / unknown"])} </FormItem>
                              <FormItem> <MandatoryLabel>If you can, you will provide an assurance guarantee that everything on your device is supported by the manufacturer and licensed properly</MandatoryLabel> {renderRadioGroup("Supported_Licensed", ["Yes", "No", "I dont know / unknown"])} </FormItem>
                              <FormItem> <MandatoryLabel>If you can, you will provide an assurance guarantee that your device and software are in "Scope" (Devices with Operating System and Software/Apps which are all getting updates and licensed)</MandatoryLabel> {renderRadioGroup("In_Scope", ["Yes", "No", "I dont know / unknown"])} </FormItem>
                              <FormItem> <MandatoryLabel>If you can, you will provide an assurance guarantee that you do not turn off automatic updates, and check bi-weekly to see if this is working</MandatoryLabel> {renderRadioGroup("Automatic_Updates", ["Yes", "No", "I dont know / unknown"])} </FormItem>
                              
                              <FormItem>
                                  <MandatoryLabel>If you can, you will provide an assurance guarantee that all of your devices have Anti-Malware protection where appropriate</MandatoryLabel>
                                  {renderRadioGroup("Anti_Malware_All", ["Yes", "No", "N/A", "I dont know / unknown"])}
                              </FormItem>
                              <FormItem>
                                  <MandatoryLabel>If you can, you will provide an assurance guarantee that your Anti-Mailware updates regularly in line with vendor guidelines</MandatoryLabel>
                                  {renderRadioGroup("Antimalware_Updates", ["Yes", "No", "N/A", "I dont know / unknown"])}
                              </FormItem>
                              <FormItem>
                                  <MandatoryLabel>Regular anti-malware scans? (e.g. Manual scans as well as leaving Real Time protection is turned on)</MandatoryLabel>
                                  {renderRadioGroup("Antimalware_Scans", ["Yes", "No", "N/A", "I dont know / unknown"])}
                              </FormItem>
                              <FormItem>
                                  <MandatoryLabel>If you can, you will provide an assurance guarantee that your Anti-Mailware scans your web traffic and protects you from visiting malicious websites</MandatoryLabel>
                                  {renderRadioGroup("Antimalware_Web_Protection", ["Yes", "No", "N/A", "I dont know / unknown"])}
                              </FormItem>
                          </div>
                      </div>
                  </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg mb-4 text-primary">Additional Help, Feedback & Consents</h3>
                  <p className="text-foreground">If you need one-to-one help with enabling BYOD, please register your request below. There is also a text box below to add your feedback or comments.</p>
                  <FormItem>
                    <MandatoryLabel>Do you need personalised help for RAR/BYOD?</MandatoryLabel>
                    <FormField
                      control={form.control}
                      name="Personalised_Help"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} value={field.value} className={`grid grid-cols-2 gap-2`}>
                              <FormItem>
                                <FormControl><RadioGroupItem value="Yes" id="help-yes" className="peer sr-only" /></FormControl>
                                <FormLabel htmlFor="help-yes" className="block w-full cursor-pointer rounded-custom border-2 border-primary bg-transparent p-3 text-center text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-ring">Yes</FormLabel>
                              </FormItem>
                              <FormItem>
                                <FormControl><RadioGroupItem value="No" id="help-no" className="peer sr-only" /></FormControl>
                                <FormLabel htmlFor="help-no" className="block w-full cursor-pointer rounded-custom border-2 border-primary bg-transparent p-3 text-center text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-ring">No</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </FormItem>
                  <FormField control={form.control} name="Comments_Feedback" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Feedback / Other Comments</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any other information you'd like to provide?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="space-y-4 pt-4">
                    <h3 className="font-semibold text-lg mb-4 text-primary">Consents & Acknowledgements</h3>
                    
                    <FormField
                      control={form.control}
                      name="Acknowledge_Policy_Compliance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <MandatoryLabel>
                              I agree to comply with the LCA Teignbridge's BYOD policy and guidelines.
                            </MandatoryLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="Acknowledge_Security_Risks"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <MandatoryLabel>
                              I understand the security risks associated with using personal devices for work purposes.
                            </MandatoryLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="Acknowledge_Security_Measures"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <MandatoryLabel>
                              I consent to any necessary security measures being implemented on my device.
                            </MandatoryLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
              
              {currentStep === 7 && (
                <div className="space-y-4 flex flex-col items-center">
                  <p className="text-lg">Please verify you are not a robot to finalize your application.</p>
                  <div ref={recaptchaContainerRef} id="recaptcha-container"></div>
                  <FormMessage>{form.formState.errors.recaptchaToken?.message}</FormMessage>
                </div>
              )}

            </CardContent>

            <CardFooter className="flex justify-between">
              {currentStep === 1 && (
                  <Button type="button" variant="outline" onClick={() => router.push('/')}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Exit to Home
                  </Button>
              )}
              {currentStep > 1 && currentStep <= totalSteps + 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
              )}

              <div className="flex items-center gap-4">
                  {currentStep < totalSteps + 1 && (
                      <Button type="button" onClick={nextStep} disabled={isLoading || (currentStep === 2 && watchedDeviceCount > 1)}>
                          Next
                      </Button>
                  )}

                  {currentStep === totalSteps + 1 && (
                      <Button type="submit" disabled={isLoading || !recaptchaToken}>
                        {isLoading ? "Submitting..." : "Submit Your Application"}
                      </Button>
                  )}
              </div>

            </CardFooter>
          </Card>
        </form>
      </Form>
      
      {isPrivacyBannerVisible && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4">
          <div className="rounded-lg border bg-background p-4 shadow-lg sm:p-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm text-foreground">
                  For more details on what data we collect and why, please{' '}
                  <a href="https://docs.google.com/document/d/1B8agUZJWDIQXdiNhSDQl33xvhcMKK7FiRulOsy-6kko/edit?tab=t.0" target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline">
                    read our "RAR" Data & Privacy Notice
                  </a>.
                </p>
              </div>
              <Button onClick={() => setPrivacyBannerVisible(false)}>
                <Check className="mr-2 h-4 w-4" />
                Agree
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

<<<<<<< Updated upstream
    

=======
>>>>>>> Stashed changes
    