
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, HelpCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          LCA Teignbridge's formal "Read, Apply, Review" (RAR) process for BYOD usage
        </h1>
        <p className="mt-6 text-lg text-black">
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
        <Card className="bg-blue-50 border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-primary">
              <HelpCircle className="h-6 w-6" />
              When to use the Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-black">
              Guidance on the circumstances under which you should complete the RAR form.
            </p>
            <Button variant="link" className="px-0 pt-4 text-base" asChild>
                <a href="https://docs.google.com/document/d/15vB9mI_JtNVp7zNMxcv7ztsKIK3_hfAuidZmS7Mdhqg/edit?usp=sharing" target="_blank" rel="noopener noreferrer">Read the Guidance</a>
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-primary">
              <FileQuestion className="h-6 w-6" />
              Why is RAR process needed?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-black">
              Understand the importance of the RAR process and why this form is a required step for using personal devices.
            </p>
             <Button variant="link" className="px-0 pt-4 text-base" asChild>
                <a href="https://docs.google.com/document/d/1v1lHiZv1lXcC_iPISWoI3lk9aGJArWMvSGucME-xzRk/edit?usp=sharing" target="_blank" rel="noopener noreferrer">Learn More</a>
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-primary">
              <CheckCircle className="h-6 w-6" />
              What to do After Submission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-black">
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
