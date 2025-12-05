
"use client";

import React, { Suspense } from 'react';
import AssessmentResults from "./results";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function AssessmentPage() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-16">
      <div className="mx-auto max-w-3xl">
        <Suspense fallback={
          <Card>
              <CardHeader>
                  <CardTitle className="font-headline">Loading Assessment...</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="h-48 w-full animate-pulse bg-muted rounded-md"></div>
              </CardContent>
          </Card>
        }>
          <AssessmentResults />
        </Suspense>
      </div>
    </main>
  );
}

export default AssessmentPage;
