/**
 * @fileoverview Google Apps Script for handling BYOD form submissions.
 * This script writes form data to a Google Sheet and sends email notifications.
 */

// --- CONFIGURATION ---
/**
 * The email address of the IT Manager who will receive notifications.
 * @type {string}
 */
const IT_MANAGER_EMAIL = 'it-manager@example.com'; // <<< IMPORTANT: REPLACE WITH ACTUAL IT MANAGER EMAIL

/**
 * The name of the sheet where form responses will be stored.
 * @type {string}
 */
const SHEET_NAME = 'RARresponses';

/**
 * The required headers for the sheet, in the correct order.
 * This array defines the columns from A to AJ.
 * @type {string[]}
 */
const HEADERS = [
  'Submission_Timestamp_ISO', 'Response_Due_Date_ISO', 'IP_Address', 'Full_Name',
  'CA_Email', 'Contact_Email', 'Contact_Number', 'Preferred_Contact_Method',
  'Reason_for_BYOD', 'Device_Type', 'Device_Count', 'Device_Model_Name',
  'OS_and_Version', 'Web_Browser_and_Version', 'Malware_Protection_Software',
  'Email_Client_Used', 'Office_Apps_Used', 'Software_Firewall_Assurance',
  'Uninstall_Unused_Apps', 'Remove_Unused_Accounts', 'Strong_Passwords_MFA_Assurance',
  'Device_Lock_Assurance', 'Separate_User_Account_Assurance', 'Update_Devices',
  'Supported_Licensed', 'In_Scope', 'Automatic_Updates', 'Anti_Malware_All',
  'Antimalware_Updates', 'Antimalware_Scans', 'Antimalware_Web_Protection',
  'Personalised_Help', 'Comments_Feedback', 'Acknowledge_Policy_Compliance',
  'Acknowledge_Security_Risks', 'Acknowledge_Security_Measures'
];

// --- SPREADSHEET & MENU SETUP ---

/**
 * Runs when the spreadsheet is opened. Adds a custom menu for administrative tasks.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('BYOD Admin')
    .addItem('Setup Sheet and Headers', 'setupHeaders')
    .addToUi();
}

/**
 * Sets up the "RARresponses" sheet and validates/writes the required headers.
 * This function is callable from the custom "BYOD Admin" menu.
 */
function setupHeaders() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    SpreadsheetApp.getUi().alert(`Sheet "${SHEET_NAME}" was created.`);
  }

  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  const currentHeaders = headerRange.getValues()[0];

  let needsUpdate = false;
  if (currentHeaders.length !== HEADERS.length) {
    needsUpdate = true;
  } else {
    for (let i = 0; i < HEADERS.length; i++) {
      if (currentHeaders[i] !== HEADERS[i]) {
        needsUpdate = true;
        break;
      }
    }
  }

  if (needsUpdate) {
    headerRange.setValues([HEADERS]);
    SpreadsheetApp.getUi().alert(`Headers have been set successfully in "${SHEET_NAME}".`);
  } else {
    SpreadsheetApp.getUi().alert(`Headers in "${SHEET_NAME}" are already correct.`);
  }
}

// --- EMAIL FUNCTIONS ---

/**
 * Sends a confirmation email to the applicant.
 * @param {object} data - The parsed JSON data from the form submission.
 */
function sendApplicantEmail(data) {
  const applicantEmail = data.CA_Email || data.Contact_Email;
  if (!applicantEmail) {
    console.error('No applicant email found (neither CA_Email nor Contact_Email was provided).');
    return;
  }
  
  const subject = 'Your BYOD RAR Application Has Been Submitted';
  
  let htmlBody = `
    <p>Dear ${data.Full_Name || 'Applicant'},</p>
    <p>Thank you for completing the "Read, Apply, Review" (RAR) process application. We have successfully received your submission made on ${new Date(data.Submission_Timestamp_ISO).toLocaleString()}.</p>
    <p>Your dedication to helping LCA Teignbridge with its Cyber Essentials (CE) certification is vital for ensuring collective security, which ultimately benefits our clients.</p>
    <h3>What to Expect Next</h3>
    <ul>
      <li><strong>Initial Review:</strong> The IT Manager will review your application to determine your device's compliance status and identify any support needs.</li>
      <li><strong>One-to-One Appointment:</strong> If you requested assistance, you will receive information on how to schedule a meeting.</li>
    </ul>
    <h3>Your Submitted Information:</h3>
    <table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">
  `;

  // Create an HTML table from the submitted data
  for (const key of HEADERS) {
    if (data.hasOwnProperty(key)) {
       htmlBody += `<tr><td style="width: 40%; font-weight: bold;">${key.replace(/_/g, ' ')}</td><td>${data[key]}</td></tr>`;
    }
  }

  htmlBody += '</table><p>You may be contacted for further information if required.</p><p>Kind regards,<br>LCA Teignbridge IT</p>';

  GmailApp.sendEmail(applicantEmail, subject, '', { htmlBody: htmlBody });
}

/**
 * Sends a notification email to the IT Manager.
 * @param {object} data - The parsed JSON data from the form submission.
 */
function sendITManagerEmail(data) {
  const subject = `New BYOD RAR Submission from ${data.Full_Name}`;
  let htmlBody = `
    <p>A new BYOD RAR application has been submitted by <strong>${data.Full_Name}</strong>.</p>
    <p>The details have been added to the "${SHEET_NAME}" Google Sheet.</p>
    <h3>Submission Details:</h3>
    <table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">
  `;

  // Create an HTML table from the submitted data
  for (const key of HEADERS) {
     if (data.hasOwnProperty(key)) {
       htmlBody += `<tr><td style="width: 40%; font-weight: bold;">${key.replace(/_/g, ' ')}</td><td>${data[key]}</td></tr>`;
    }
  }

  htmlBody += '</table><p>Please review the submission in the Google Sheet at your earliest convenience.</p>';
  
  GmailApp.sendEmail(IT_MANAGER_EMAIL, subject, '', { htmlBody: htmlBody });
}


// --- WEB APP ENTRY POINT ---

/**
 * Handles HTTP POST requests from the web application.
 * @param {object} e - The event parameter containing the POST data.
 * @returns {ContentService.TextOutput} A JSON response indicating success or failure.
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); 

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      setupHeaders();
      sheet = spreadsheet.getSheetByName(SHEET_NAME);
    }
    
    const data = JSON.parse(e.postData.contents);
    const rowData = HEADERS.map(header => data[header] !== undefined ? data[header] : 'N/A');

    sheet.appendRow(rowData);
    
    // Send emails after data has been written successfully
    sendApplicantEmail(data);
    sendITManagerEmail(data);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Data saved and emails sent.' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
