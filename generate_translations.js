const fs = require('fs');
const path = require('path');

const languages = ['en', 'hi', 'ta', 'te', 'kn', 'bn', 'mr', 'gu', 'pa', 'ur'];

const baseTranslation = {
  common: {
    loading: "Loading...",
    error: "An error occurred",
    save: "Save",
    cancel: "Cancel",
    submit: "Submit"
  },
  nav: {
    findTherapist: "Find a Therapist",
    login: "Log In",
    signup: "Sign Up",
    dashboard: "Dashboard",
    logout: "Log Out"
  },
  auth: {
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number (10 digits)",
    password: "Password",
    state: "State",
    preferredLanguage: "Preferred Language",
    signupClient: "Complete Sign Up",
    signupTherapist: "Register as Therapist"
  },
  dashboard: {
    welcome: "Welcome",
    upcomingSessions: "Upcoming Sessions",
    moodJournal: "Mood Journal",
    bookNew: "Book New Session"
  },
  mood: {
    excellent: "Excellent",
    good: "Good",
    okay: "Okay",
    poor: "Poor",
    very_poor: "Very Poor",
    logMood: "Log Mood",
    notePlaceholder: "How are you feeling today?"
  },
  therapistList: {
    title: "Find Your Perfect Match",
    subtitle: "Browse through our directory of licensed, vetted professionals.",
    filters: "Filters",
    specialization: "Specialization",
    language: "Language",
    maxFee: "Max Fee (₹)",
    rating: "Minimum Rating",
    bookNow: "Book Now",
    feePerSession: "per session"
  },
  booking: {
    title: "Book a Session",
    selectDate: "Select Date",
    selectTime: "Select Time",
    sessionType: "Session Type",
    chat: "Live Chat",
    video: "Video Call",
    payWithRazorpay: "Pay with Razorpay",
    amountToPay: "Amount to Pay",
    platformFee: "Includes 20% platform fee"
  }
};

const dir = path.join(__dirname, 'translations');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

languages.forEach(lang => {
  // In a real scenario, this script would integrate with a translation API (like Google Translate)
  // For now, we populate all 10 JSON files with the English keys so the app doesn't crash,
  // but prefix with the language code to prove it's working.
  
  const localized = JSON.parse(JSON.stringify(baseTranslation));
  
  if (lang !== 'en') {
    for (const section in localized) {
      for (const key in localized[section]) {
        localized[section][key] = `[${lang.toUpperCase()}] ${localized[section][key]}`;
      }
    }
  }

  fs.writeFileSync(path.join(dir, `${lang}.json`), JSON.stringify(localized, null, 2));
});

console.log("Translation files generated successfully.");
