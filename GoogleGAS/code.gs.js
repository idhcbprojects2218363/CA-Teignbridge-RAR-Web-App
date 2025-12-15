<<<<<<< Updated upstream
/**
 * @fileoverview Google Apps Script for handling BYOD form submissions.
 * This script writes form data to a Google Sheet and sends email notifications.
 */
=======

const SHEET_ID = "YOUR_GOOGLE_SHEET_ID"; // Replace with your Google Sheet ID
const SHEET_NAME = "YOUR_SHEET_TAB_NAME";
const IT_MANAGER_EMAIL = "your-it-manager-email@example.com"; // Replace with IT Manager's email
>>>>>>> Stashed changes

const HEADERS = [
<<<<<<< Updated upstream
  'Submission_Timestamp_ISO', 'Response_Due_Date_ISO', 'IP_Address', 'Full_Name',
  'CA_Email', 'Contact_Email', 'Contact_Number', 'Preferred_Contact_Method',
=======
  'Submission_ID', 'Submission_Timestamp_ISO', 'Response_Due_Date_ISO', 'IP_Address', 'Full_Name',
  'Contact_Email', 'Receive_Copy', 'Contact_Number', 'Preferred_Contact_Method',
>>>>>>> Stashed changes
  'Reason_for_BYOD', 'Device_Type', 'Device_Count', 'Device_Model_Name',
  'OS_and_Version', 'Web_Browser_and_Version', 'Malware_Protection_Software',
  'Email_Client_Used', 'Office_Apps_Used', 'Other_Cloud_Services', 'MFA_On_Cloud_Services',
  'Software_Firewall_Assurance',
  'Uninstall_Unused_Apps', 'Remove_Unused_Accounts', 'Strong_Passwords_MFA_Assurance',
<<<<<<< Updated upstream
  'Device_Lock_Assurance', 'Separate_User_Account_Assurance', 'Update_Devices',
  'Supported_Licensed', 'In_Scope', 'Automatic_Updates', 'Anti_Malware_All',
  'Antimalware_Updates', 'Antimalware_Scans', 'Antimalware_Web_Protection',
  'Personalised_Help', 'Comments_Feedback', 'Acknowledge_Policy_Compliance',
  'Acknowledge_Security_Risks', 'Acknowledge_Security_Measures'
=======
  'Device_Lock_Assurance', 'Separate_User_Account_Assurance', 'Official_App_Stores_Assurance',
  'AutoRun_Disabled_Assurance', 'Update_Devices', 'Supported_Licensed', 'In_Scope', 'Automatic_Updates',
  'Anti_Malware_All', 'Antimalware_Updates', 'Antimalware_Scans',
  'Antimalware_Web_Protection', 'Personalised_Help', 'Comments_Feedback',
  'Acknowledge_Policy_Compliance', 'Acknowledge_Security_Risks', 'Acknowledge_Security_Measures'
>>>>>>> Stashed changes
];


/**
 * Creates a menu item in the Google Sheet to run the setup function.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Admin')
    .addItem('Setup Sheet Headers', 'setupSheet')
    .addItem('Verify Headers', 'verifySheetHeaders')
    .addItem('Backfill Submission IDs', 'backfillSubmissionIDs')
    .addToUi();
}

<<<<<<< Updated upstream
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
=======

/**
 * Sets up the sheet by populating any empty cells in the header row.
 * Run this function manually from the Apps Script editor.
 */
function setupSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const headerRange = sheet.getRange(1, 1, 1, sheet.getMaxColumns());
  const headerValues = headerRange.getValues()[0];
  let updated = false;

  for (let i = 0; i < HEADERS.length; i++) {
    if (!headerValues[i]) { // If the cell is empty
      sheet.getRange(1, i + 1).setValue(HEADERS[i]);
      updated = true;
    }
  }

  if (updated) {
    SpreadsheetApp.getUi().alert('Sheet headers have been updated successfully.');
>>>>>>> Stashed changes
  } else {
    SpreadsheetApp.getUi().alert('Headers already seem to be in place. No changes made.');
  }
}


/**
 * Compares the actual sheet headers with the expected HEADERS constant.
 * Reports all mismatches to the user via a single alert.
 */
function verifySheetHeaders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const ui = SpreadsheetApp.getUi();

  const lastColumn = sheet.getLastColumn();
  const actualHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];

  let mismatches = [];
  let scriptIndex = 0;
  let sheetIndex = 0;

  while (scriptIndex < HEADERS.length || sheetIndex < actualHeaders.length) {
    const expected = HEADERS[scriptIndex];
    const actual = actualHeaders[sheetIndex];

    if (expected === actual) {
      // Headers match, advance both pointers
      scriptIndex++;
      sheetIndex++;
    } else {
      // Headers do not match
      const mismatchMessage = 
        `Mismatch at Column ${String.fromCharCode(65 + sheetIndex)}:\n` +
        `  - Expected: "${expected || '[End of Script Headers]'}"\n` +
        `  - Found: "${actual || '[End of Sheet Headers]'}"`;
      mismatches.push(mismatchMessage);

      // Check if the expected header exists later in the sheet
      const foundIndex = actualHeaders.indexOf(expected, sheetIndex + 1);
      
      if (foundIndex !== -1) {
        // Found the expected header later, implies missing columns in between.
        // We advance the scriptIndex and let the loop continue checking the sheet columns
        // against the next expected headers. This correctly identifies renamed columns.
         scriptIndex++;
      } else {
        // Could not find the expected header later in the sheet.
        // This could mean a renamed column or an extra column in the sheet.
        // Advance both to prevent an infinite loop.
        scriptIndex++;
        sheetIndex++;
      }
    }
  }

<<<<<<< Updated upstream
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
=======
  if (mismatches.length > 0) {
    let message = 'Header verification found mismatches!\n\n' +
                  'Please review the list below. For each mismatch, you may need to insert a new column to the left of the specified column. After making corrections, rerun this verification.\n\n' +
                  mismatches.join('\n\n');
    ui.alert('Header Mismatch', message, ui.ButtonSet.OK);
  } else {
    ui.alert('Header verification successful! All columns match the script definition.');
  }
}


/**
 * Backfills missing Submission_IDs for existing records.
 * Iterates through the sheet, and for any row with an empty Submission_ID,
 * it generates a new ID based on the Submission_Timestamp_ISO.
 */
function backfillSubmissionIDs() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const ui = SpreadsheetApp.getUi();

  const headerRow = values[0];
  const idColIndex = headerRow.indexOf('Submission_ID');
  const timestampColIndex = headerRow.indexOf('Submission_Timestamp_ISO');

  if (idColIndex === -1 || timestampColIndex === -1) {
    ui.alert('Error: Could not find "Submission_ID" or "Submission_Timestamp_ISO" columns.');
>>>>>>> Stashed changes
    return;
  }

  let updatedCount = 0;

  for (let i = 1; i < values.length; i++) { // Start from row 2 (index 1)
    const row = values[i];
    if (!row[idColIndex] && row[timestampColIndex]) { // If ID is empty but timestamp exists
      const timestampStr = row[timestampColIndex];
      const date = new Date(timestampStr);

      if (!isNaN(date.getTime())) {
        const yyyy = date.getUTCFullYear();
        const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(date.getUTCDate()).padStart(2, '0');
        const hh = String(date.getUTCHours()).padStart(2, '0');
        const min = String(date.getUTCMinutes()).padStart(2, '0');
        const ss = String(date.getUTCSeconds()).padStart(2, '0');
        const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        
        const newId = `${yyyy}${mm}${dd}-${hh}${min}${ss}-${randomPart}`;
        
        sheet.getRange(i + 1, idColIndex + 1).setValue(newId);
        updatedCount++;
      }
    }
  }

  if (updatedCount > 0) {
    ui.alert(`Successfully backfilled ${updatedCount} Submission IDs.`);
  } else {
    ui.alert('No empty Submission IDs found to backfill.');
  }
}


/**
 * Handles HTTP POST requests, appends data to the sheet, and sends emails.
 * This is the new primary function for handling form submissions.
 * @param {Object} e The event object from the POST request.
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

<<<<<<< Updated upstream
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      setupHeaders();
      sheet = spreadsheet.getSheetByName(SHEET_NAME);
    }
=======
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
>>>>>>> Stashed changes
    
    // The data from the Next.js server action will be in a JSON string in the post body.
    const submissionData = JSON.parse(e.postData.contents);

    // Create the row data in the correct order based on HEADERS
    const rowData = HEADERS.map(header => submissionData[header] || ''); // Use empty string for missing values

    // Append the new row to the sheet
    sheet.appendRow(rowData);
    
<<<<<<< Updated upstream
    // Send emails after data has been written successfully
    sendApplicantEmail(data);
    sendITManagerEmail(data);
=======
    // Trigger the emails with the received data
    if (submissionData.Receive_Copy) {
      sendApplicantEmail(submissionData);
    }
    sendITManagerEmail(submissionData);
>>>>>>> Stashed changes

    // Return a success response
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    // Return an error response to the calling application
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'message': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
      if (lock.hasLock()) {
        lock.releaseLock();
      }
  }
}


/**
 * Sends a confirmation email to the applicant.
 * @param {Object} data The submission data.
 */
function sendApplicantEmail(data) {
  const recipient = data.Contact_Email;
  const subject = `Your RAR Application Has Been Submitted (ID: ${data.Submission_ID})`;
  let body = `
    <p>Dear ${data.Full_Name},</p>
    <p>Thank you for completing the "Read, Apply, Review" (RAR) process application. Your submission has been received and will be reviewed by the IT Manager.</p>
    <p><strong>Your Submission ID:</strong> ${data.Submission_ID}</p>
    <p>Please quote this ID in any communication with the IT Manager.</p>
    <p><strong>Submission Details:</strong></p>
    <ul>
  `;

  for (const key in data) {
    // Only include fields that have a value and are part of the headers.
    if (data[key] && HEADERS.includes(key)) {
      body += `<li><strong>${key.replace(/_/g, ' ')}:</strong> ${data[key]}</li>`;
    }
  }
  
  body += `
    </ul>
    <p><strong>What's Next?</strong></p>
    <p>The IT Manager will review your application. If you requested personalised help, please ensure you book a 1-to-1 appointment using the link on the submission confirmation page.</p>
    <p>If you missed the booking link, or if you selected "No" for help but have changed your mind, please refer to the document below for guidance on next steps.</p>
    <p><strong>Read Now:</strong> <a href="https://YOUR_AFTER_SUBMISSION_FAQ_DOCUMENT">What to do After your submission</a></p>
    <p>Thank you for your cooperation.</p>
    <p>LCA Teignbridge IT</p>
  `;

  GmailApp.sendEmail(recipient, subject, "", {
    htmlBody: body,
    name: 'LCA Teignbridge IT'
  });
}

/**
 * Sends a notification email to the IT Manager.
 * @param {Object} data The submission data.
 */
function sendITManagerEmail(data) {
  const recipient = IT_MANAGER_EMAIL;
  const subject = `New RAR Application Submitted by ${data.Full_Name} (ID: ${data.Submission_ID})`;
  const sheetUrl = SpreadsheetApp.openById(SHEET_ID).getUrl();
  let body = `
    <p>A new RAR application has been submitted.</p>
    <p><strong>Submission ID:</strong> ${data.Submission_ID}</p>
    <p><strong>Applicant:</strong> ${data.Full_Name}</p>
    <p><strong>Contact Email:</strong> ${data.Contact_Email}</p>
    <p><strong>Submission Timestamp:</strong> ${data.Submission_Timestamp_ISO}</p>
    <p>Full details have been added to the Google Sheet. <a href="${sheetUrl}">Click here to view the sheet.</a></p>
    <hr>
    <p><strong>Full Submission Details:</strong></p>
    <ul>
  `;

  for (const key in data) {
     if (data[key] && HEADERS.includes(key)) {
      body += `<li><strong>${key.replace(/_/g, ' ')}:</strong> ${data[key]}</li>`;
    }
  }

   body += `</ul>`;

  GmailApp.sendEmail(recipient, subject, "", {
    htmlBody: body,
  });
}

    

    
