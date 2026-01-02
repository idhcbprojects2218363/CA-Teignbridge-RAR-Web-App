
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, HelpCircle, CheckCircle, ShieldQuestion } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          LCA Teignbridge's formal "Read, Apply, Review" (RAR) process for BYOD usage
        </h1>
        <p className="mt-6 text-lg text-foreground">
          Welcome and thank you for visiting.
          <br />
          Before you fill out the form, please read the guidance cards below the following button
        </p>
        <div className="mt-10">
          <Button asChild size="lg" className="font-bold text-lg">
            <Link href="/form">Submit RAR Application</Link>
          </Button>
        </div>
      </div>

      <div className="mt-20 grid gap-8 md:grid-cols-3">
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-primary">
              <HelpCircle className="h-6 w-6" />
              Guidance for Using the Form
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            <p>
              Guidance on the circumstances under which you should complete the RAR form.
            </p>
            <Button variant="link" className="h-auto whitespace-normal px-0 pt-4 text-base justify-start text-left" asChild>
                <a href={process.env.NEXT_PUBLIC_GUIDANCE_WHEN_TO_USE_FORM_URL} target="_blank" rel="noopener noreferrer">When to Use the Form</a>
            </Button>
            <Button variant="link" className="h-auto whitespace-normal px-0 pt-2 text-base justify-start text-left" asChild>
                <a href={process.env.NEXT_PUBLIC_GUIDANCE_WHEN_NOT_TO_USE_FORM_URL} target="_blank" rel="noopener noreferrer">When NOT to Use the Form</a>
            </Button>
            <Button variant="link" className="h-auto whitespace-normal px-0 pt-2 text-base justify-start text-left" asChild>
                <a href={process.env.NEXT_PUBLIC_GUIDANCE_IS_FORM_MANDATORY_URL} target="_blank" rel="noopener noreferrer">Is This Form Mandatory?</a>
            </Button>
            <Button variant="link" className="h-auto whitespace-normal px-0 pt-2 text-base justify-start text-left" asChild>
                <a href={process.env.NEXT_PUBLIC_GUIDANCE_USE_CASE_SCENARIOS_URL} target="_blank" rel="noopener noreferrer">View Use-Case Scenarios</a>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-primary">
              <ShieldQuestion className="h-6 w-6" />
              Why is the RAR process needed?
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            <p>
              Understand the importance of the RAR process, why we ask specific questions, and what data we collect.
            </p>
             <Button variant="link" className="h-auto whitespace-normal px-0 pt-4 text-base justify-start text-left" asChild>
                <a href={process.env.NEXT_PUBLIC_GUIDANCE_RAR_PROCESS_URL} target="_blank" rel="noopener noreferrer">Learn about the RAR process</a>
            </Button>
            <Button variant="link" className="h-auto whitespace-normal px-0 pt-2 text-base justify-start text-left" asChild>
                <a href={process.env.NEXT_PUBLIC_GUIDANCE_PRIVACY_NOTICE_URL} target="_blank" rel="noopener noreferrer">Read our "RAR" Data & Privacy Notice</a>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-primary">
              <CheckCircle className="h-6 w-6" />
              What to do After Submission
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            <p>
              Find out about the next steps, what to expect, and how to get help after you have submitted the form.
            </p>
            <Button variant="link" className="h-auto whitespace-normal px-0 pt-4 text-base justify-start text-left" asChild>
                <a href={process.env.NEXT_PUBLIC_GUIDANCE_AFTER_SUBMISSION_URL} target="_blank" rel="noopener noreferrer">Next Steps: After your submission</a>
            </Button>
            <Button variant="link" className="h-auto whitespace-normal px-0 pt-2 text-base justify-start text-left" asChild>
                <a href={process.env.NEXT_PUBLIC_GUIDANCE_SELF_HELP_URL} target="_blank" rel="noopener noreferrer">Next Steps: Self-Help Guide and Requesting Assistance</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
