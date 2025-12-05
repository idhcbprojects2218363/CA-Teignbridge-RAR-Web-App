
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formSchema, type FormSchema } from "@/lib/form-schema";

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
  ChevronRight
} from "lucide-react";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";

const totalSteps = 5;

// Make grecaptcha available in the window object
declare global {
  interface Window {
    grecaptcha: any;
  }
}

const MandatoryLabel = ({ children }: { children: React.ReactNode }) => (
  <FormLabel className="font-bold">
    {children} <span className="text-red-500">*</span>
  </FormLabel>
);

export default function ComplianceForm() {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [submissionTime, setSubmissionTime] = React.useState<Date | null>(null);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Full_Name: "",
      CA_Email: "",
      Contact_Email: "",
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
      Software_Firewall_Assurance: undefined,
      Uninstall_Unused_Apps: undefined,
      Remove_Unused_Accounts: undefined,
      Strong_Passwords_MFA_Assurance: undefined,
      Device_Lock_Assurance: undefined,
      Separate_User_Account_Assurance: undefined,
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
      IP_Address: "..."
    },
  });

  React.useEffect(() => {
    const fetchIpAndSetBrowserData = async () => {
      // Fetch IP
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        form.setValue("IP_Address", data.ip);
      } catch (error) {
        console.error("Failed to fetch IP address", error);
        form.setValue("IP_Address", "Unavailable");
      }

      // Set browser data only on the client
      if (typeof window !== "undefined") {
        const userAgent = navigator.userAgent;
        
        const osMatch = userAgent.match(/\(([^)]+)\)/);
        const osInfo = osMatch ? osMatch[1].split(';')[0] : 'Unknown OS';
        form.setValue("OS_and_Version", osInfo.trim());
        
        const parts = userAgent.split(' ');
        const browserInfo = parts.find(p => p.includes('Chrome/') || p.includes('Firefox/') || p.includes('Safari/')) || userAgent;
        form.setValue("Web_Browser_and_Version", browserInfo);
      }
    };

    fetchIpAndSetBrowserData();
  }, [form]);

  const watchedDeviceType = form.watch("Device_Type");
  const watchedDeviceCount = form.watch("Device_Count");
  const caEmail = form.watch("CA_Email");
  const contactEmail = form.watch("Contact_Email");
  const contactNumber = form.watch("Contact_Number");

  type FieldName = keyof FormSchema;

  const personalFields: FieldName[] = ["Full_Name", "CA_Email", "Contact_Email", "Contact_Number", "Preferred_Contact_Method"];
  const deviceFields: FieldName[] = ["Reason_for_BYOD", "Device_Type", "Device_Count", "Device_Model_Name", "OS_and_Version", "Web_Browser_and_Version"];
  const softwareFields: FieldName[] = ["Malware_Protection_Software", "Email_Client_Used", "Office_Apps_Used"];
  const securityFields: FieldName[] = [
    "Software_Firewall_Assurance", "Uninstall_Unused_Apps", "Remove_Unused_Accounts",
    "Strong_Passwords_MFA_Assurance", "Device_Lock_Assurance", "Separate_User_Account_Assurance",
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
    if (currentStep === 4) {
      fieldsToValidate = [...securityFields];
      if (watchedDeviceType !== 'computer (desktop or laptop)') {
         fieldsToValidate = fieldsToValidate.filter(f => f !== 'Separate_User_Account_Assurance');
      }
    }
    if (currentStep === 5) fieldsToValidate = finalFields;


    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      if (watchedDeviceCount > 1 && currentStep === 2) {
        // Do not proceed if device count is more than 1
        return;
      }
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1);
      } else {
        // This is the final step, trigger the form submission
        await form.handleSubmit(onSubmit)();
      }
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = (data: FormSchema) => {
    setIsLoading(true);
    setSubmissionTime(new Date());

    if (!window.grecaptcha || !window.grecaptcha.enterprise) {
      console.error("reCAPTCHA enterprise script not loaded");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not verify you are human. Please reload the page and try again.",
      });
      setIsLoading(false);
      return;
    }

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
        console.error("reCAPTCHA site key not found in environment variables.");
        setIsLoading(false);
        return;
    }
    
    window.grecaptcha.enterprise.ready(async () => {
      try {
        const token = await window.grecaptcha.enterprise.execute(siteKey, { action: 'submit' });
        const result = await handleComplianceCheck(data, token);
        if (result.success) {
          router.push("/assessment");
        } else {
          throw new Error(result.error || "An unknown error occurred.");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Submission failed. Please try again.";
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    });
  };


  const stepDescriptions: { [key: number]: string } = {
    1: "Your Details",
    2: "Your Device",
    3: "Software Setup",
    4: "Security Measures",
    5: "Final Thoughts & Consent"
  };

  const renderRadioGroup = (name: FieldName, options: string[]) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={String(field.value ?? "")}
              className={`grid grid-cols-2 md:grid-cols-3 gap-2`}
            >
              {options.map((option) => (
                <FormItem key={option}>
                  <FormControl>
                    <RadioGroupItem value={option} id={`${name.toString()}-${option}`} className="peer sr-only" />
                  </FormControl>
                  <FormLabel htmlFor={`${name.toString()}-${option}`} className="block w-full cursor-pointer rounded-md border-2 border-primary bg-transparent p-3 text-center text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-ring">
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
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center text-lg">
          <span className="font-bold text-foreground">Step {currentStep} of {totalSteps}</span>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
          <span className="font-bold text-primary">{stepDescriptions[currentStep]}</span>
        </div>
        <Progress value={(currentStep / totalSteps) * 100} className="mt-2" />
        {(currentStep === 2 || currentStep === 3) && (
          <p className="pt-4 text-sm text-black">If a question does not apply please type none or N/A.</p>
        )}
        {currentStep === 4 && (
          <div className="pt-4 space-y-2">
            <p className="text-sm text-black">
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <input type="hidden" {...form.register("IP_Address")} />

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
                <FormField control={form.control} name="CA_Email" render={({ field }) => (
                  <FormItem>
                    <MandatoryLabel>CA Email</MandatoryLabel>
                     <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="user@company.com" {...field} className="pl-10"/>
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
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {[
                          { value: "CA_Email", label: `CA Email ${caEmail ? `(${caEmail})` : ''}` },
                          { value: "Contact_Email", label: `Contact Email ${contactEmail ? `(${contactEmail})` : ''}` },
                          { value: "Contact_Number", label: `Contact Number ${contactNumber ? `(${contactNumber})` : ''}` }
                        ].map(option => (
                           <FormItem key={option.value}>
                             <FormControl>
                               <RadioGroupItem value={option.value} id={`preferred-${option.value}`} className="peer sr-only"/>
                             </FormControl>
                             <FormLabel htmlFor={`preferred-${option.value}`} className="block w-full cursor-pointer rounded-md border-2 border-primary bg-transparent p-3 text-center text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-ring">
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                 </div>
            )}
            
            {currentStep === 4 && (
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Security measures - guarantees "Assurances"</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <FormItem> <MandatoryLabel>If you can, you will provide an assurance guarantee that you have not disabled your software firewall:*</MandatoryLabel> {renderRadioGroup("Software_Firewall_Assurance", ["Yes", "No", "N/A"])} </FormItem>
                            <FormItem> <MandatoryLabel>If you can, you will provide an assurance guarantee that once you no longer need an App or Software, you uninstall it from your device:*</MandatoryLabel> {renderRadioGroup("Uninstall_Unused_Apps", ["Yes", "No"])} </FormItem>
                            <FormItem> <MandatoryLabel>If you can, you will provide an assurance guarantee that you only have the accounts you need on your device and no more. Any accounts which are no longer used should ideally be removed from the device:*</MandatoryLabel> {renderRadioGroup("Remove_Unused_Accounts", ["Yes", "No"])} </FormItem>
                            <FormItem> <MandatoryLabel>If you can, you will provide an assurance guarantee that on your device (e.g. mobile devices) or user accounts (e.g. computer) are protected using "strong passwords (possibly 12 characters long), 6-digit pin, MFA", or other appropriate alternatives:*</MandatoryLabel> {renderRadioGroup("Strong_Passwords_MFA_Assurance", ["Yes", "No"])} </FormItem>
                            <FormItem> <MandatoryLabel>If you can, you will provide an assurance guarantee that your device locks when left idle for long enough, may run a screen saver, and requires a password, pin or biometric to unlock:*</MandatoryLabel> {renderRadioGroup("Device_Lock_Assurance", ["Yes", "No"])} </FormItem>
                            {watchedDeviceType === 'computer (desktop or laptop)' && <FormItem> <MandatoryLabel>If you can, you will provide an assurance guarantee that you will create a separate user account or profile on your device for LCA Teignbridge work (keeps your personal information private and isolated):*</MandatoryLabel> {renderRadioGroup("Separate_User_Account_Assurance", ["Yes", "No", "N/A"])} </FormItem>}
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold text-lg mb-4">Updates and Unsupported (OS, Software, Apps, etc.) - guarantees "Assurances"</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <FormItem> <MandatoryLabel>If you can, you will provide an assurance guarantee that you update your devices you use to do work for LCA Teignbrige:*</MandatoryLabel> {renderRadioGroup("Update_Devices", ["Yes", "No"])} </FormItem>
                            <FormItem> <MandatoryLabel>If you can, you will provide an assurance guarantee that everything on your device is supported by the manufacturer and licensed properly:*</MandatoryLabel> {renderRadioGroup("Supported_Licensed", ["Yes", "No"])} </FormItem>
                            <FormItem> <MandatoryLabel>If you can, you will provide an assurance guarantee that your device and software are in "Scope" (Devices with Operating System and Software/Apps which are all getting updates and licensed):*</MandatoryLabel> {renderRadioGroup("In_Scope", ["Yes", "No"])} </FormItem>
                            <FormItem> <MandatoryLabel>If you can, you will provide an assurance guarantee that you do not turn off automatic updates, and check bi-weekly to see if this is working:*</MandatoryLabel> {renderRadioGroup("Automatic_Updates", ["Yes", "No"])} </FormItem>
                            <FormItem> <MandatoryLabel>If you can, you will provide an assurance guarantee that all of your devices have Anti-Malware protection where appropriate:*</MandatoryLabel> {renderRadioGroup("Anti_Malware_All", ["Yes", "No", "N/A"])} </FormItem>
                            <FormItem> <MandatoryLabel>If you can, you will provide an assurance guarantee that your Anti-Mailware updates regularly in line with vendor guidelines:*</MandatoryLabel> {renderRadioGroup("Antimalware_Updates", ["Yes", "No", "N/A"])} </FormItem>
                             <FormItem> <MandatoryLabel>Regular anti-malware scans? (e.g. Manual scans as well as leaving Real Time protection is turned on) *</MandatoryLabel> {renderRadioGroup("Antimalware_Scans", ["Yes", "No", "N/A"])} </FormItem>
                             <FormItem> <MandatoryLabel>If you can, you will provide an assurance guarantee that your Anti-Mailware scans your web traffic and protects you from visiting malicious websites:*</MandatoryLabel> {renderRadioGroup("Antimalware_Web_Protection", ["Yes", "No", "N/A"])} </FormItem>
                        </div>
                    </div>
                </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                 <p className="text-black">If you need one-to-one help with enabling BYOD, please register your request below. There is also a text box below to add your feedback or comments.</p>
                <FormItem>
                  <MandatoryLabel>Do you need personalised help for RAR/BYOD?</MandatoryLabel>
                  {renderRadioGroup("Personalised_Help", ["Yes", "No"])}
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
                  <h3 className="font-semibold text-lg">Consents & Acknowledgements</h3>
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

                 {submissionTime && (
                  <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                    <h3 className="font-semibold text-muted-foreground">Submission Details (For IT Use):</h3>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <p><strong>Current Date and time (submission):</strong> {submissionTime.toLocaleString()}</p>
                      <p><strong>Initial Response No Later Than:</strong> {new Date(submissionTime.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
            ) : <div />}
            <Button type="button" onClick={nextStep} disabled={isLoading || (currentStep === 2 && watchedDeviceCount > 1)}>
              {currentStep < totalSteps ? "Next" : (isLoading ? "Verifying..." : "Submit Your Application")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
