import ComplianceForm from '@/components/compliance-form';

export default function FormPage() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            BYOD RAR Application Form
          </h1>
          <p className="mt-4 text-lg text-black">
            All fields marked with an <span className="text-red-500 font-bold">*</span> are mandatory.
          </p>
        </div>
        <ComplianceForm />
      </div>
    </main>
  );
}
