"use server";

import { formSchema, type FormSchema } from "@/lib/form-schema";
import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';

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
        },
      },
      parent: projectPath,
    };

    const [response] = await client.createAssessment(request);

    if (!response.tokenProperties?.valid) {
      console.log(`The CreateAssessment call failed because the token was: ${response.tokenProperties?.invalidReason}`);
      return false;
    }

    if (response.tokenProperties.action === recaptchaAction) {
      if (response.riskAnalysis && response.riskAnalysis.score >= 0.5) {
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
  }
}


async function sendToGoogleSheet(data: FormSchema) {
  const googleScriptWebAppUrl = process.env.GOOGLE_SCRIPT_WEB_APP_URL || "";

  if (!googleScriptWebAppUrl) {
    console.warn("Google Apps Script URL is not configured in .env file. Skipping Google Sheet submission.");
    return { success: true };
  }

  const now = new Date();
  const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

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
  };


  try {
    const response = await fetch(googleScriptWebAppUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sheetData),
    });

    const result = await response.json();

    if (result.status === "success") {
      return { success: true };
    } else {
      console.error("Error sending data to Google Sheet:", result.message);
      return { success: false, error: "Failed to save data to Google Sheet." };
    }
  } catch (error) {
    console.error("Error calling Google Apps Script:", error);
    return { success: false, error: "An error occurred while communicating with Google Sheets." };
  }
}

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
  
  if (!sheetResult.success) {
     return { success: false, error: sheetResult.error };
  }

  // Since the AI assessment is removed, we just return a success response.
  // The 'data' property can be a simple object.
  return { success: true, data: { status: "submitted" } };
}
