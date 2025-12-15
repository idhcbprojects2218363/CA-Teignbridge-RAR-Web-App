
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
<<<<<<< Updated upstream
        <p className="mt-6 text-lg text-black">
          Welcome and thank you for visiting this introduction page.
=======
        <p className="mt-6 text-lg text-foreground">
          Welcome and thank you for visiting.
>>>>>>> Stashed changes
          <br />
          Before you fill out the form please read the following guidance.
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
<<<<<<< Updated upstream
          <CardContent>
            <p className="text-black">
              Guidance on the circumstances under which you should complete the RAR for BYOD form.
            </p>
            <Button variant="link" className="px-0 pt-4 text-base" asChild>
                <a href="" target="_blank" rel="noopener noreferrer">Read the Guidance</a>
=======
          <CardContent className="flex flex-col">
            <p>
              Guidance on the circumstances under which you should complete the RAR form.
            </p>
            <Button variant="link" className="px-0 pt-4 text-base justify-start" asChild>
                <a href="https://docs.google.com/document/d/15vB9mI_JtNVp7zNMxcv7ztsKIK3_hfAuidZmS7Mdhqg/edit?usp=sharing" target="_blank" rel="noopener noreferrer">When to Use the Form</a>
            </Button>
            <Button variant="link" className="px-0 pt-2 text-base justify-start" asChild>
                <a href="https://docs.google.com/document/d/1OpTbxKHke7epPdYoSLqp-JjviVzpHi6mJl52lIqBFS0/edit?usp=sharing" target="_blank" rel="noopener noreferrer">When NOT to Use the Form</a>
            </Button>
            <Button variant="link" className="px-0 pt-2 text-base justify-start" asChild>
                <a href="https://docs.google.com/document/d/1LUJDYWfittqWyCUk0dxaRebL3P3fpmJ0giwFX7JTqDg/edit?usp=sharing" target="_blank" rel="noopener noreferrer">Is This Form Mandatory?</a>
            </Button>
            <Button variant="link" className="px-0 pt-2 text-base justify-start" asChild>
                <a href="https://docs.google.com/document/d/1Sh1-Sb9qsasVIAgg0BAtRf-e5qYxq1-Ck4NY86LIjTM/edit?usp=sharing" target="_blank" rel="noopener noreferrer">View Use-Case Scenarios</a>
>>>>>>> Stashed changes
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
             <Button variant="link" className="px-0 pt-4 text-base" asChild>
<<<<<<< Updated upstream
                <a href="" target="_blank" rel="noopener noreferrer">Learn More</a>
=======
                <a href="https://docs.google.com/document/d/1v1lHiZv1lXcC_iPISWoI3lk9aGJArWMvSGucME-xzRk/edit?usp=sharing" target="_blank" rel="noopener noreferrer">Learn about the RAR process</a>
            </Button>
            <Button variant="link" className="px-0 pt-2 text-base" asChild>
                <a href="https://docs.google.com/document/d/1B8agUZJWDIQXdiNhSDQl33xvhcMKK7FiRulOsy-6kko/edit?tab=t.0" target="_blank" rel="noopener noreferrer">Read our "RAR" Data & Privacy Notice</a>
>>>>>>> Stashed changes
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
          <CardContent>
            <p>
              Find out about the next steps, what to expect, and how to get help after you have submitted the form.
            </p>
            <Button variant="link" className="px-0 pt-4 text-base" asChild>
                <a href="" target="_blank" rel="noopener noreferrer">See Next Steps</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
