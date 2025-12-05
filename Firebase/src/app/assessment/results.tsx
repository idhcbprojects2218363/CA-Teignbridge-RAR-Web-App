
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, CheckCircle2 } from "lucide-react";

export default function AssessmentResults() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Thank You! Your RAR Application Has Been Submitted.
        </h1>
        <p className="mt-4 text-lg text-card-foreground">
             Thank you for completing the "Read, Apply, Review" (RAR) process application. Your dedication to helping LCA Teignbridge with its Cyber Essentials (CE) certification is vital for ensuring collective security, which ultimately benefits our clients.
        </p>
         <p className="mt-4 text-lg text-card-foreground">
            We have received your information regarding your Bring Your Own Device (BYOD) usage. Here is what you can expect next:
        </p>
      </div>

      <Card className="bg-blue-50 border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-headline text-primary"><CheckCircle2 className="text-green-500 h-6 w-6"/>The Review Process</CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="list-disc space-y-3 pl-5 text-card-foreground/90">
                <li>
                    <strong>Initial Review:</strong> The IT Manager will review your application to determine your device's compliance status and identify any support needs. If necessary, they will discuss your application in appropriate management meetings.
                </li>
                <li>
                    <strong>One-to-One Appointment:</strong> If you requested assistance on the form, please use the self-service booking link below to schedule your consultation with the IT Manager.
                </li>
                <li>
                    <strong>Periodic Spot Checks:</strong> As part of ongoing compliance requirements, your application and device may undergo periodic spot checks (annually or biannually) by the IT Manager or an external auditor.
                </li>
                 <li>
                    <strong>Working Together:</strong> By collaborating more closely with you to find solutions if your device becomes non-compliant or is at risk, we can ensure our commitment to protecting LCA Teignbridge while delivering the best possible service for our clients.
                </li>
                 <li>
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4"/>
                        <strong>Read the FAQ:</strong>
                        <a href="https://docs.google.com/document/d/1bcFQqoVxUZUtMcK8GgXE7tqyTAF2-p9Iwq2Ug3bj_fQ/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                             What to do After your submission
                        </a>
                    </div>
                </li>
            </ul>
        </CardContent>
      </Card>
    
      <Card className="bg-blue-50 border-2 border-primary">
          <CardHeader className="items-center">
              <CardTitle className="flex items-center gap-2 text-xl font-headline text-primary"><Calendar /> Schedule Your 1-to-1</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-center">
              <p>If you requested a meeting, schedule your 1-to-1 appointment now:</p>
              <Button asChild size="lg">
                  <a href="https://calendar.app.google/BYLddTWzP88xxuLm7" target="_blank" rel="noopener noreferrer">
                      Book Your Appointment (Google Calendar)
                  </a>
              </Button>
               <div className="bg-yellow-50 border border-yellow-400 text-red-700 text-sm rounded-md p-3 max-w-md mx-auto">
                    *Please ensure you only use this booking system if you requested a meeting on the application form.
               </div>
          </CardContent>
      </Card>
      
      <Card className="bg-blue-50 border-2 border-primary">
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
