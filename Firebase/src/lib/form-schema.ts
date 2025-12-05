
import { z } from "zod";

export const formSchema = z.object({
  Full_Name: z.string().min(2, "Full name must be at least 2 characters.").max(255),
  CA_Email: z.string().email("Invalid email address.").max(255),
  Contact_Email: z.string().email("Invalid email address.").max(255),
  Contact_Number: z.string().regex(/^(?:(?:\+44\s?|0)\d{2,4}\s?\d{3,4}\s?\d{3,4})$/, "Please enter a valid UK phone number."),
  Preferred_Contact_Method: z.enum(['CA_Email', 'Contact_Email', 'Contact_Number'], { required_error: "Please select a preferred contact method." }),
  Reason_for_BYOD: z.string().min(5, "Please provide a brief reason (min 5 characters)."),
  Device_Type: z.enum(['mobile devices (smartphone, tablet or hybrid)', 'computer (desktop or laptop)'], { required_error: "Please select a device type." }),
  Device_Count: z.coerce.number({required_error: "Please enter a number.", invalid_type_error: "Please enter a number."}).int().min(1, "Must be at least 1."),
  Device_Model_Name: z.string().min(2, "Please enter a device model.").max(255),
  OS_and_Version: z.string().min(2, "Please enter OS and version.").max(255),
  Web_Browser_and_Version: z.string().min(2, "Please enter browser and version.").max(255),
  Malware_Protection_Software: z.string().min(2, "Please enter malware protection software.").max(255),
  Email_Client_Used: z.string().min(2, "Please enter email client.").max(255),
  Office_Apps_Used: z.string().min(2, "Please enter office apps used.").max(255),
  Software_Firewall_Assurance: z.enum(['Yes', 'No', 'N/A'], { required_error: "Please select an option." }),
  Uninstall_Unused_Apps: z.enum(['Yes', 'No'], { required_error: "Please select an option." }),
  Remove_Unused_Accounts: z.enum(['Yes', 'No'], { required_error: "Please select an option." }),
  Strong_Passwords_MFA_Assurance: z.enum(['Yes', 'No'], { required_error: "Please select an option." }),
  Device_Lock_Assurance: z.enum(['Yes', 'No'], { required_error: "Please select an option." }),
  Separate_User_Account_Assurance: z.enum(['Yes', 'No', 'N/A']).optional(),
  Update_Devices: z.enum(['Yes', 'No'], { required_error: "Please select an option." }),
  Supported_Licensed: z.enum(['Yes', 'No'], { required_error: "Please select an option." }),
  In_Scope: z.enum(['Yes', 'No'], { required_error: "Please select an option." }),
  Automatic_Updates: z.enum(['Yes', 'No'], { required_error: "Please select an option." }),
  Anti_Malware_All: z.enum(['Yes', 'No', 'N/A'], { required_error: "Please select an option." }),
  Antimalware_Updates: z.enum(['Yes', 'No', 'N/A'], { required_error: "Please select an option." }),
  Antimalware_Scans: z.enum(['Yes', 'No', 'N/A'], { required_error: "Please select an option." }),
  Antimalware_Web_Protection: z.enum(['Yes', 'No', 'N/A'], { required_error: "Please select an option." }),
  Personalised_Help: z.enum(['Yes', 'No'], { required_error: "Please select an option." }),
  Comments_Feedback: z.string().optional(),
  IP_Address: z.string(),
  Acknowledge_Policy_Compliance: z.boolean().refine(val => val === true, {
    message: "You must agree to comply with the policy.",
  }),
  Acknowledge_Security_Risks: z.boolean().refine(val => val === true, {
    message: "You must acknowledge the security risks.",
  }),
  Acknowledge_Security_Measures: z.boolean().refine(val => val === true, {
    message: "You must consent to necessary security measures.",
  }),
});

export type FormSchema = z.infer<typeof formSchema>;
