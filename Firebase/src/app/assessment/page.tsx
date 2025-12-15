
"use client";

import React, { Suspense } from 'react';
import AssessmentResults from "./results";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

function AssessmentPage() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-16">
      <div className="mx-auto max-w-3xl">
        <Suspense fallback={<AssessmentLoadingSkeleton />}>
          <AssessmentResults />
        </Suspense>
      </div>
    </main>
  );
}

function AssessmentLoadingSkeleton() {
    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <Skeleton className="h-10 w-3/4 mx-auto" />
                <Skeleton className="h-8 w-1/2 mx-auto" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6 mx-auto" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-11/12" />
                    <Skeleton className="h-5 w-10/12" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="items-center">
                    <Skeleton className="h-8 w-64" />
                </CardHeader>
                <CardContent className="space-y-3 text-center">
                    <Skeleton className="h-5 w-3/4 mx-auto" />
                    <Skeleton className="h-12 w-64 mx-auto" />
                </CardContent>
            </Card>
        </div>
    );
}

export default AssessmentPage;
