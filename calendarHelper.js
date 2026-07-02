export const getGoogleCalendarLink = (appointment) => {
  const { therapistId, date, timeSlot } = appointment;
  const therapistName = therapistId?.name || 'Therapist';
  
  // Parse date and timeSlot. E.g. date: "2026-06-29", timeSlot: "10:00 AM - 11:00 AM" or similar
  const startAndEnd = timeSlot.split(' - ');
  const startTimeStr = startAndEnd[0] || '10:00 AM';
  const endTimeStr = startAndEnd[1] || '11:00 AM';

  const parseTime = (timeStr, baseDate) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    const d = new Date(baseDate);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const start = parseTime(startTimeStr, date);
  const end = parseTime(endTimeStr, date);

  const formatToUTCString = (d) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const dates = `${formatToUTCString(start)}/${formatToUTCString(end)}`;
  const text = encodeURIComponent(`Therapeya Therapy Session with Dr. ${therapistName}`);
  const details = encodeURIComponent(`Your scheduled session format: ${appointment.sessionType}. Join from your Therapeya dashboard.`);
  const location = encodeURIComponent(`Therapeya Online Video/Chat Room`);

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}&sf=true&output=xml`;
};

export const getOutlookCalendarLink = (appointment) => {
  const { therapistId, date, timeSlot } = appointment;
  const therapistName = therapistId?.name || 'Therapist';
  
  const startAndEnd = timeSlot.split(' - ');
  const startTimeStr = startAndEnd[0] || '10:00 AM';
  const endTimeStr = startAndEnd[1] || '11:00 AM';

  const parseTime = (timeStr, baseDate) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    const d = new Date(baseDate);
    d.setHours(hours, parseInt(minutes, 10), 0, 0);
    return d;
  };

  const start = parseTime(startTimeStr, date);
  const end = parseTime(endTimeStr, date);

  const startdt = start.toISOString();
  const enddt = end.toISOString();

  const subject = encodeURIComponent(`Therapeya Therapy Session with Dr. ${therapistName}`);
  const body = encodeURIComponent(`Your scheduled session format: ${appointment.sessionType}. Join from your Therapeya dashboard.`);
  const location = encodeURIComponent(`Therapeya Online Video/Chat Room`);

  return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${subject}&startdt=${startdt}&enddt=${enddt}&body=${body}&location=${location}`;
};
