"use server";

import { formSchema, type FormSchema } from "@/lib/form-schema";
import { format } from "date-fns";

<<<<<<< Updated upstream
async function verifyRecaptcha(token: string): Promise<boolean> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const recaptchaAction = "submit";

  if (!projectId || !recaptchaKey) {
    console.error("reCAPTCHA environment variables not set (GOOGLE_CLOUD_PROJECT_ID or NEXT_PUBLIC_RECAPTCHA_SITE_KEY).");
    return process.env.NODE_ENV !== "production";
  }

  try {
    const client = new RecaptchaEnterpriseServiceClient();
    const projectPath = client.projectPath(projectId);

    const request = {
      assessment: {
        event: {
          token: token,
          siteKey: recaptchaKey,
=======
async function verifyRecaptcha(token: string, remoteip?: string) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
      console.error("reCAPTCHA secret key is not set in environment variables.");
      return { success: false, error: "Server configuration error for reCAPTCHA." };
  }

  const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';

  try {
    const response = await fetch(verificationUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
>>>>>>> Stashed changes
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
          ...(remoteip && { remoteip }),
        })
    });

    const data = await response.json();

    if (data.success) {
        return { success: true };
    } else {
        console.error(`Failed reCAPTCHA verification: ${data['error-codes']?.join(', ')}`);
        return { success: false, error: `Failed reCAPTCHA verification.` };
    }
<<<<<<< Updated upstream

    if (response.tokenProperties.action === recaptchaAction) {
      if (response.riskAnalysis && response.riskAnalysis.score != null && response.riskAnalysis.score >= 0.5) {
        console.log(`The reCAPTCHA score is: ${response.riskAnalysis.score}`);
        return true;
      } else {
        console.log(`Low reCAPTCHA score: ${response.riskAnalysis?.score}`);
        return false;
      }
    } else {
      console.log("The action attribute in your reCAPTCHA tag does not match the action you are expecting to score");
      return false;
    }
  } catch (error) {
    console.error("Error during reCAPTCHA verification:", error);
    return false;
=======
  } catch (error) {
    console.error("Error during reCAPTCHA verification request:", error);
    return { success: false, error: "An error occurred during reCAPTCHA verification." };
>>>>>>> Stashed changes
  }
}

async function sendToGoogleAppsScript(data: FormSchema & { Submission_ID: string }) {
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

  if (!scriptUrl) {
    console.error("Google Apps Script URL is not configured.");
    return { success: false, error: "Server is not configured to save data." };
  }
  
  const now = new Date();
  const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
<<<<<<< Updated upstream

  // Shape the data to match what the Google Sheet script expects
  const sheetData = {
    ...data,
    Submission_Timestamp_ISO: now.toISOString(),
    Response_Due_Date_ISO: dueDate.toISOString(),
    Separate_User_Account_Assurance: data.Device_Type === 'computer (desktop or laptop)' ? data.Separate_User_Account_Assurance ?? 'N/A' : 'N/A',
    Anti_Malware_All: data.Anti_Malware_All ?? 'N/A',
    Antimalware_Updates: data.Antimalware_Updates ?? 'N/A',
    Antimalware_Scans: data.Antimalware_Scans ?? 'N/A',
    Antimalware_Web_Protection: data.Antimalware_Web_Protection ?? 'N/A',
    Software_Firewall_Assurance: data.Software_Firewall_Assurance ?? 'N/A',
    Comments_Feedback: data.Comments_Feedback ?? "",
=======
  
  const fullData = {
    ...data,
    Submission_Timestamp_ISO: now.toISOString(),
    Response_Due_Date_ISO: dueDate.toISOString(),
>>>>>>> Stashed changes
  };

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fullData),
      redirect: 'follow', 
    });

<<<<<<< Updated upstream
    const result = await response.json();
=======
    const responseBody = await response.json();

    if (responseBody.result === 'success') {
      return { success: true, submissionId: data.Submission_ID };
    } else {
      console.error("Error from Google Apps Script:", responseBody.message);
      return { success: false, error: responseBody.message || "An unknown error occurred in the script." };
    }
>>>>>>> Stashed changes

    if (result.status === "success") {
      return { success: true };
    } else {
      console.error("Error sending data to Google Sheet:", result.message);
      return { success: false, error: "Failed to save data to Google Sheet." };
    }
  } catch (error) {
    console.error("Error sending data to Google Apps Script:", error);
    const errorMessage = error instanceof Error ? error.message : "An internal error occurred while contacting the save service.";
    return { success: false, error: `Failed to save data: ${errorMessage}` };
  }
}

<<<<<<< Updated upstream
export async function handleComplianceCheck(data: FormSchema, recaptchaToken: string) {
  const isHuman = await verifyRecaptcha(recaptchaToken);
  if (!isHuman) {
    return { success: false, error: "reCAPTCHA verification failed. Please try again." };
  }
  
  const parsedData = formSchema.safeParse(data);

  if (!parsedData.success) {
    return { success: false, error: "Invalid data provided." };
  }

  // Send data to Google Sheet.
  const sheetResult = await sendToGoogleSheet(parsedData.data);
=======
export async function handleComplianceCheck(data: FormSchema) {
  
  // Honeypot check
  if (data.Fax) {
    console.warn("Honeypot field filled. Submission silently rejected.");
    return { success: true, data: { submissionId: "honeypot-triggered" } };
  }
  
  const recaptchaToken = data.recaptchaToken;

  if (!recaptchaToken) {
    return { success: false, error: "reCAPTCHA token is missing. Please try again." };
  }
  
  // Verify reCAPTCHA
  const recaptchaResult = await verifyRecaptcha(recaptchaToken, data.IP_Address);
  if (!recaptchaResult.success) {
    return { success: false, error: recaptchaResult.error };
  }
>>>>>>> Stashed changes
  
  // Generate Submission ID
  const timestampPart = format(new Date(), 'yyyyMMdd-HHmmss');
  const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const submissionId = `${timestampPart}-${randomPart}`;

  const dataWithId = { ...data, Submission_ID: submissionId };

  // The data is already validated by the client form.
  // Now, send it to Google Apps Script which will handle sheet writing and emailing.
  const scriptResult = await sendToGoogleAppsScript(dataWithId);
  
  if (!scriptResult.success) {
     return { success: false, error: scriptResult.error };
  }

<<<<<<< Updated upstream
  // Since the AI assessment is removed, we just return a success response.
  // The 'data' property can be a simple object.
  return { success: true, data: { status: "submitted" } };
=======
  return { success: true, data: { submissionId: scriptResult.submissionId } };
>>>>>>> Stashed changes
}
