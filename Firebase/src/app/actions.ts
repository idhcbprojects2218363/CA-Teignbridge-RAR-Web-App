
"use server";

import { formSchema, type FormSchema } from "@/lib/form-schema";
import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';

async function verifyRecaptcha(token: string): Promise<boolean> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const privateKey = process.env.RECAPTCHA_PRIVATE_KEY;
  const clientEmail = process.env.RECAPTCHA_CLIENT_EMAIL;

  if (!projectId || !recaptchaKey || !privateKey || !clientEmail) {
    console.error("reCAPTCHA environment variables are not fully set. Please check your .env file and ensure you have a service account key.");
    return false;
  }

  // The private key from the .env file might have escaped newlines.
  // We need to replace them with actual newline characters.
  const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

  try {
    const client = new RecaptchaEnterpriseServiceClient({
      credentials: {
        private_key: formattedPrivateKey,
        client_email: clientEmail,
      },
      project_id: projectId,
    });
    
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

    if (response.riskAnalysis && response.riskAnalysis.score != null) {
      console.log(`The reCAPTCHA score is: ${response.riskAnalysis.score}`);
      // Adjust this threshold based on your risk tolerance
      return response.riskAnalysis.score > 0.5;
    }
    
    console.warn("reCAPTCHA score was not available, but token was valid. Accepting by default.");
    return true;

  } catch (error) {
    console.error("Error during reCAPTCHA verification client call:", error);
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
    Receive_Copy: data.Receive_Copy ?? false,
  };


  try {
    const response = await fetch(googleScriptWebAppUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sheetData),
    });

    const responseText = await response.text();
    
    try {
        const result = JSON.parse(responseText);
        if (result.status === "success") {
            return { success: true };
        } else {
            console.error("Error sending data to Google Sheet (from script):", result.message);
            return { success: false, error: "Failed to save data to Google Sheet." };
        }
    } catch (e) {
        console.error("Failed to parse JSON response from Google Apps Script. Raw response:", responseText);
        return { success: false, error: "Invalid response from Google Apps Script." };
    }

  } catch (error) {
    console.error("Error calling Google Apps Script:", error);
    return { success: false, error: "An error occurred while communicating with Google Sheets." };
  }
}

export async function handleComplianceCheck(formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  // For reCAPTCHA v2, the token is in the 'g-recaptcha-response' field.
  const recaptchaToken = formData.get("g-recaptcha-response") as string;
  
  if (!recaptchaToken) {
    return { success: false, error: "reCAPTCHA token not found. Please check the box." };
  }

  const isHuman = await verifyRecaptcha(recaptchaToken);
  if (!isHuman) {
    return { success: false, error: "reCAPTCHA verification failed. Please try again." };
  }
  
  // Need to manually convert checkbox values and numbers from the FormData
  const processedData = {
      ...data,
      Device_Count: Number(data.Device_Count || 1),
      Receive_Copy: data.Receive_Copy === 'on',
      Acknowledge_Policy_Compliance: data.Acknowledge_Policy_Compliance === 'on',
      Acknowledge_Security_Risks: data.Acknowledge_Security_Risks === 'on',
      Acknowledge_Security_Measures: data.Acknowledge_Security_Measures === 'on',
  };

  const parsedData = formSchema.safeParse(processedData);

  if (!parsedData.success) {
    console.error("Zod validation errors:", parsedData.error.errors);
    return { success: false, error: "Invalid data provided.", issues: parsedData.error.errors };
  }

  const sheetResult = await sendToGoogleSheet(parsedData.data);
  
  if (!sheetResult.success) {
     return { success: false, error: sheetResult.error };
  }

  return { success: true, data: { status: "submitted" } };
}
