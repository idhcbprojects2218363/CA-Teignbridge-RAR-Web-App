
"use server";

import { formSchema, type FormSchema } from "@/lib/form-schema";
import { format } from "date-fns";

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
  } catch (error) {
    console.error("Error during reCAPTCHA verification request:", error);
    return { success: false, error: "An error occurred during reCAPTCHA verification." };
  }
}

<<<<<<< Updated upstream
async function sendToGoogleAppsScript(data: any) {
=======
async function sendToGoogleAppsScript(data: FormSchema & { Submission_ID: string }) {
>>>>>>> Stashed changes
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

  if (!scriptUrl) {
    console.error("Google Apps Script URL is not configured.");
    return { success: false, error: "Server is not configured to save data." };
  }
  
<<<<<<< Updated upstream
  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      redirect: 'follow', 
    });

    const responseBody = await response.json();

    if (responseBody.result === 'success') {
      return { success: true, submissionId: data.Submission_ID };
    } else {
      console.error("Error from Google Apps Script:", responseBody.message);
      return { success: false, error: responseBody.message || "An unknown error occurred in the script." };
    }

  } catch (error) {
    console.error("Error sending data to Google Apps Script:", error);
    const errorMessage = error instanceof Error ? error.message : "An internal error occurred while contacting the save service.";
    return { success: false, error: `Failed to save data: ${errorMessage}` };
  }
}

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
  
  // Generate Submission ID
  const now = new Date();
  const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const timestampPart = format(now, 'yyyyMMdd-HHmmss');
  const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const submissionId = `${timestampPart}-${randomPart}`;

  // This object MUST contain ALL fields expected by the Google Apps Script in the correct order.
  const fullData = {
    Submission_ID: submissionId,
    Submission_Timestamp_ISO: now.toISOString(),
    Response_Due_Date_ISO: dueDate.toISOString(),
    IP_Address: data.IP_Address,
    Full_Name: data.Full_Name,
    Contact_Email: data.Contact_Email,
    Receive_Copy: data.Receive_Copy,
    Contact_Number: data.Contact_Number,
    Preferred_Contact_Method: data.Preferred_Contact_Method,
    Reason_for_BYOD: data.Reason_for_BYOD,
    Device_Type: data.Device_Type,
    Device_Count: data.Device_Count,
    Device_Model_Name: data.Device_Model_Name,
    OS_and_Version: data.OS_and_Version,
    Web_Browser_and_Version: data.Web_Browser_and_Version,
    Malware_Protection_Software: data.Malware_Protection_Software,
    Email_Client_Used: data.Email_Client_Used,
    Office_Apps_Used: data.Office_Apps_Used,
    Other_Cloud_Services: data.Other_Cloud_Services || 'N/A',
    MFA_On_Cloud_Services: data.MFA_On_Cloud_Services || 'I dont know / unknown',
    Software_Firewall_Assurance: data.Software_Firewall_Assurance,
    Uninstall_Unused_Apps: data.Uninstall_Unused_Apps,
    Remove_Unused_Accounts: data.Remove_Unused_Accounts,
    Strong_Passwords_MFA_Assurance: data.Strong_Passwords_MFA_Assurance,
    Device_Lock_Assurance: data.Device_Lock_Assurance,
    Separate_User_Account_Assurance: data.Separate_User_Account_Assurance,
    Official_App_Stores_Assurance: data.Official_App_Stores_Assurance,
    AutoRun_Disabled_Assurance: data.AutoRun_Disabled_Assurance,
    Update_Devices: data.Update_Devices,
    Supported_Licensed: data.Supported_Licensed,
    In_Scope: data.In_Scope,
    Automatic_Updates: data.Automatic_Updates,
    Anti_Malware_All: data.Anti_Malware_All,
    Antimalware_Updates: data.Antimalware_Updates,
    Antimalware_Scans: data.Antimalware_Scans,
    Antimalware_Web_Protection: data.Antimalware_Web_Protection,
    Personalised_Help: data.Personalised_Help,
    Comments_Feedback: data.Comments_Feedback || '',
    Acknowledge_Policy_Compliance: data.Acknowledge_Policy_Compliance,
    Acknowledge_Security_Risks: data.Acknowledge_Security_Risks,
    Acknowledge_Security_Measures: data.Acknowledge_Security_Measures
  };

  // Send it to Google Apps Script which will handle sheet writing and emailing.
  const scriptResult = await sendToGoogleAppsScript(fullData);
  
  if (!scriptResult.success) {
     return { success: false, error: scriptResult.error };
  }
=======
  const now = new Date();
  const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const fullData = {
    ...data,
    Submission_Timestamp_ISO: now.toISOString(),
    Response_Due_Date_ISO: dueDate.toISOString(),
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

    const responseBody = await response.json();

    if (responseBody.result === 'success') {
      return { success: true, submissionId: data.Submission_ID };
    } else {
      console.error("Error from Google Apps Script:", responseBody.message);
      return { success: false, error: responseBody.message || "An unknown error occurred in the script." };
    }

  } catch (error) {
    console.error("Error sending data to Google Apps Script:", error);
    const errorMessage = error instanceof Error ? error.message : "An internal error occurred while contacting the save service.";
    return { success: false, error: `Failed to save data: ${errorMessage}` };
  }
}

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
>>>>>>> Stashed changes

  return { success: true, data: { submissionId: scriptResult.submissionId } };
}
