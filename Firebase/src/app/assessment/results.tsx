
"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function SuccessView({ submissionId }: { submissionId: string | null }) {
    return (
        <Alert className="mt-6 text-left border-2 border-primary">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle className="font-bold text-lg">Your Submission ID</AlertTitle>
          <AlertDescription>
            <p>Please make a note of this ID for your records. You may need to quote it if you communicate with the IT Manager.</p>
            <p className="font-mono text-base font-bold text-primary mt-2 break-all">
              {submissionId || 'ID-GENERATING...'}
            </p>
          </AlertDescription>
        </Alert>
    );
}

function ErrorView({ error }: { error: string | null }) {
    return (
        <Alert variant="destructive" className="mt-6 text-left border-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-bold text-lg">Submission Failed</AlertTitle>
          <AlertDescription>
            <p>We were unable to process your application due to an error. Please contact the IT Manager and provide the following error message:</p>
            <p className="font-mono text-base font-bold mt-2 break-all">
              {error || 'An unknown error occurred.'}
            </p>
          </AlertDescription>
        </Alert>
    );
}

export default function AssessmentResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("submissionId");
  const error = searchParams.get("error");

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            {error ? "There Was a Problem" : "Thank You! Your RAR Application Has Been Submitted."}
        </h1>
        
        {error ? <ErrorView error={error} /> : <SuccessView submissionId={submissionId} />}

        <p className="mt-6 text-lg text-card-foreground">
             Thank you for completing the "Read, Apply, Review" (RAR) process application. Your dedication to helping LCA Teignbridge with its Cyber Essentials (CE) certification is vital for ensuring collective security, which ultimately benefits our clients.
        </p>
         <p className="mt-4 text-lg text-card-foreground">
            We have received your information regarding your Bring Your Own Device (BYOD) usage. Here is what you can expect next:
        </p>
      </div>

      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-headline text-primary"><CheckCircle2 className="text-green-500 h-6 w-6"/>The Review Process</CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="list-disc space-y-3 pl-5 text-card-foreground/90">
                <li>
                    <strong>Initial Review:</strong> The IT Manager will review your application to determine your device's compliance status and identify any support needs. If there are any concerns, your application will be discussed as necessary with the appropriate individuals before making a decision.
                </li>
                <li>
                    <strong>One-to-One Appointment:</strong> If you requested assistance on the form, please use the self-service booking link below to schedule your consultation with the IT Manager.
                </li>
                <li>
                    <strong>Periodic Spot Checks:</strong> As part of ongoing compliance requirements, your device may undergo periodic spot checks “bi-weekly, monthly or quarterly” by the IT Manager. Your application will be kept under review by the IT Manager to ensure that access is issued to personal devices appropriately at all times.
                </li>
                 <li>
                    <strong>Working Together:</strong> By collaborating more closely with you, the IT Manager aims to find appropriate solutions should your device become non-compliant (a security risk and out of scope with CE requirements) while we jointly ensure our commitment to protecting LCA Teignbridge, and aiming to deliver the best possible service for our clients.
                </li>
                 <li>
                    <div className="flex flex-col items-start gap-2">
                        <div className="flex items-center gap-2">
                           <FileText className="h-4 w-4"/>
                           <strong>Read the Guidance:</strong>
                        </div>
                        <div className="flex flex-col pl-6">
                             <a href={process.env.NEXT_PUBLIC_GUIDANCE_SELF_HELP_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 whitespace-normal text-left">
                                Next Steps: Self-Help Guide and Requesting Assistance
                            </a>
                        </div>
                    </div>
                </li>
            </ul>
             <div className="mt-6 text-card-foreground/90">
                <h3 className="text-xl font-headline font-semibold text-primary mb-2">Once your RAR Application has been approved</h3>
                <p className="mt-2">Once your application has been approved, you can use the self-help (see above).</p>
                <ul className="list-disc pl-5 my-2">
                  <li>Please note that your mobile device, “smartphone or tablet”, may not get immediate access if you have followed the self-help instructions exactly.</li>
                </ul>
                <p>This is normal, as these devices likely require manual approval from the IT Manager. The IT manager will get an email notification of your request, which will be <span className="italic underline">granted automatically</span> since your <span className="italic underline">RAR Application is already approved</span>.</p>
              </div>
        </CardContent>
      </Card>
    
      <Card className="border-2 border-primary">
          <CardHeader className="items-center">
              <CardTitle className="flex items-center gap-2 text-xl font-headline text-primary"><Calendar /> Schedule Your 1-to-1</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-center">
              <p>If you requested a meeting, schedule your 1-to-1 appointment now:</p>
              <Button asChild size="lg">
                  <a href={process.env.NEXT_PUBLIC_APPOINTMENT_BOOKING_URL} target="_blank" rel="noopener noreferrer">
                      Book Your Appointment (Google Calendar)
                  </a>
              </Button>
               <div className="bg-yellow-50 border border-yellow-400 text-red-700 text-sm rounded-md p-3 max-w-md mx-auto">
                    *Please ensure you only use this booking system if you requested a meeting on the application form.
               </div>
          </CardContent>
      </Card>
      
      <Card className="border-2 border-primary">
        <CardContent className="text-center space-y-4 p-6">
            <div className="bg-yellow-50 border-yellow-400 border-2 p-4 rounded-md">
                <p className="font-bold text-red-700">
                    You may now close this window or browser tab.
                </p>
            </div>
            <Button onClick={() => router.push("/form")} size="lg">
                Complete Another Assessment
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
