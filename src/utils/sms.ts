// SMS notification utility for limited internet regions
// This is a placeholder implementation that would connect to an SMS service provider
// For production, integrate with services like Twilio, Africa's Talking, or similar

export interface SMSConfig {
  enabled: boolean;
  phoneNumber: string;
  provider: 'twilio' | 'africas_talking' | 'custom';
  apiKey?: string;
}

export interface SMSMessage {
  to: string;
  message: string;
  priority?: 'low' | 'normal' | 'high';
}

export const DEFAULT_SMS_CONFIG: SMSConfig = {
  enabled: false,
  phoneNumber: '',
  provider: 'twilio'
};

export const saveSMSConfig = (config: SMSConfig): void => {
  localStorage.setItem('ett_sms_config', JSON.stringify(config));
};

export const loadSMSConfig = (): SMSConfig => {
  try {
    const saved = localStorage.getItem('ett_sms_config');
    return saved ? JSON.parse(saved) : DEFAULT_SMS_CONFIG;
  } catch (e) {
    console.error('Failed to load SMS config:', e);
    return DEFAULT_SMS_CONFIG;
  }
};

export const sendSMS = async (message: SMSMessage): Promise<boolean> => {
  // Placeholder implementation - would connect to actual SMS provider
  console.log('Sending SMS:', message);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In production, this would make an API call to your SMS provider
  // Example with Twilio:
  // const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': 'Basic ' + btoa(YOUR_ACCOUNT_SID + ':' + YOUR_AUTH_TOKEN),
  //     'Content-Type': 'application/x-www-form-urlencoded'
  //   },
  //   body: new URLSearchParams({
  //     To: message.to,
  //     From: YOUR_TWILIO_PHONE_NUMBER,
  //     Body: message.message
  //   })
  // });
  
  return true;
};

export const enableSMSNotifications = (): void => {
  const config = loadSMSConfig();
  config.enabled = true;
  saveSMSConfig(config);
};

export const disableSMSNotifications = (): void => {
  const config = loadSMSConfig();
  config.enabled = false;
  saveSMSConfig(config);
};

export const sendReportSubmissionSMS = async (phoneNumber: string, reportDetails: string): Promise<boolean> => {
  const message: SMSMessage = {
    to: phoneNumber,
    message: `ETT Report Submitted: ${reportDetails}. Thank you for your submission.`,
    priority: 'normal'
  };
  
  return sendSMS(message);
};

export const sendDeadlineReminderSMS = async (phoneNumber: string, deadline: string): Promise<boolean> => {
  const message: SMSMessage = {
    to: phoneNumber,
    message: `ETT Reminder: Report submission deadline is ${deadline}. Please submit your report on time.`,
    priority: 'high'
  };
  
  return sendSMS(message);
};

export const sendApprovalNotificationSMS = async (phoneNumber: string, reportId: number, status: string): Promise<boolean> => {
  const message: SMSMessage = {
    to: phoneNumber,
    message: `ETT Update: Report #${reportId} has been ${status}. Check the dashboard for details.`,
    priority: 'normal'
  };
  
  return sendSMS(message);
};
