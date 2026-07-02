require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const TherapistProfile = require('./models/TherapistProfile');
const Appointment = require('./models/Appointment');
const Message = require('./models/Message');
const Review = require('./models/Review');
const MoodJournal = require('./models/MoodJournal');

const seedData = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/therapy-platform';

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await TherapistProfile.deleteMany({});
    await Appointment.deleteMany({});
    await Message.deleteMany({});
    await Review.deleteMany({});
    await MoodJournal.deleteMany({});
    console.log('Cleaned existing collections.');

    // Common Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Create Admin
    const adminUser = new User({
      name: 'Admin Director',
      email: 'admin@platform.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+18005550199',
      profilePhoto: ''
    });
    await adminUser.save();
    console.log('Seeded Admin account (admin@platform.com)');

    // 2. Create Clients (3 accounts)
    const clientData = [
      { name: 'Sarah Jenkins', email: 'sarah@client.com', phone: '+12025550143' },
      { name: 'David Miller', email: 'david@client.com', phone: '+12025550187' },
      { name: 'Elena Rostova', email: 'elena@client.com', phone: '+12025550112' }
    ];

    const clients = [];
    for (const c of clientData) {
      const user = new User({
        name: c.name,
        email: c.email,
        password: hashedPassword,
        role: 'client',
        phone: c.phone
      });
      const savedUser = await user.save();
      clients.push(savedUser);
    }
    console.log('Seeded 3 Client accounts.');

    // 3. Create Therapists (5 accounts)
    const therapistData = [
      {
        name: 'Dr. Evelyn Carter',
        email: 'evelyn@therapist.com',
        phone: '+14155552381',
        bio: 'Dr. Evelyn Carter is a clinical psychologist with 12 years of experience specializing in trauma recovery and cognitive behavioral therapy (CBT). She helps clients overcome anxiety, build resilience, and establish healthy boundary systems in high-stress careers.',
        licenseNumber: 'LPSY-9821-CA',
        experience: 12,
        sessionFee: 1500, // INR/USD
        specializations: ['Trauma', 'Anxiety', 'Depression'],
        languages: ['English', 'Spanish'],
        sessionType: ['both']
      },
      {
        name: 'James O’Connor',
        email: 'james@therapist.com',
        phone: '+14155552382',
        bio: 'James O’Connor is a Licensed Marriage and Family Therapist (LMFT) focused on couples therapy, relationship counseling, and conflict resolution. He utilizes emotionally focused therapy (EFT) to mend connections and support family wellness.',
        licenseNumber: 'LMFT-4731-NY',
        experience: 8,
        sessionFee: 1800,
        specializations: ['Couples', 'Anxiety', 'Family Conflict'],
        languages: ['English'],
        sessionType: ['video']
      },
      {
        name: 'Dr. Aarav Patel',
        email: 'aarav@therapist.com',
        phone: '+14155552383',
        bio: 'Dr. Aarav Patel specializes in adolescent mental health, stress management, and ADHD coping strategies. Over the past 10 years, he has partnered with young adults to improve focus, self-esteem, and stress relief.',
        licenseNumber: 'LPSY-2219-IL',
        experience: 10,
        sessionFee: 1200,
        specializations: ['ADHD', 'Anxiety', 'Stress Management'],
        languages: ['English', 'Hindi'],
        sessionType: ['chat']
      },
      {
        name: 'Maya Lin',
        email: 'maya@therapist.com',
        phone: '+14155552384',
        bio: 'Maya Lin is an integrative therapist working with grief recovery, self-worth issues, and depression. Her warm, compassionate approach integrates mindfulness practices with psychodynamic talk therapy to uncover growth paths.',
        licenseNumber: 'LCSW-8842-WA',
        experience: 7,
        sessionFee: 1100,
        specializations: ['Depression', 'Grief', 'Trauma'],
        languages: ['English', 'Mandarin'],
        sessionType: ['both']
      },
      {
        name: 'Sofia Rodriguez',
        email: 'sofia@therapist.com',
        phone: '+14155552385',
        bio: 'Sofia Rodriguez is a bilingual licensed therapist focusing on panic disorders, OCD, and phobias. She is dedicated to providing evidence-based practices such as exposure response prevention (ERP) in English and Spanish.',
        licenseNumber: 'LMHC-5509-TX',
        experience: 6,
        sessionFee: 1300,
        specializations: ['Anxiety', 'OCD', 'Phobias'],
        languages: ['English', 'Spanish'],
        sessionType: ['chat']
      }
    ];

    const therapists = [];
    const therapistProfiles = [];

    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
      { startTime: '09:00 AM', endTime: '10:00 AM' },
      { startTime: '10:00 AM', endTime: '11:00 AM' },
      { startTime: '11:00 AM', endTime: '12:00 PM' },
      { startTime: '02:00 PM', endTime: '03:00 PM' },
      { startTime: '03:00 PM', endTime: '04:00 PM' },
      { startTime: '04:00 PM', endTime: '05:00 PM' }
    ];

    for (const t of therapistData) {
      const user = new User({
        name: t.name,
        email: t.email,
        password: hashedPassword,
        role: 'therapist',
        phone: t.phone
      });
      const savedUser = await user.save();
      therapists.push(savedUser);

      // Build availability slots
      const availability = weekDays.map(day => ({
        day,
        slots: timeSlots.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          isBooked: false
        }))
      }));

      const profile = new TherapistProfile({
        userId: savedUser._id,
        licenseNumber: t.licenseNumber,
        specializations: t.specializations,
        languages: t.languages,
        bio: t.bio,
        experience: t.experience,
        sessionFee: t.sessionFee,
        sessionType: t.sessionType,
        approvalStatus: 'approved',
        availability
      });

      const savedProfile = await profile.save();
      therapistProfiles.push(savedProfile);
    }
    console.log('Seeded 5 approved Therapist accounts and profiles.');

    // 4. Create Appointments (10 sessions)
    // We'll create upcoming, completed, and cancelled appointments.
    const appointmentDates = [
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
      new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // In 4 days
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // In 5 days
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // In 10 days
      new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)  // 10 days ago (cancelled)
    ];

    const appointments = [];
    // Helper to format booking slot in therapistProfile availability
    const markSlotBooked = async (therapistUserId, date, slotStr) => {
      const profile = await TherapistProfile.findOne({ userId: therapistUserId });
      if (profile) {
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        const daySchedule = profile.availability.find(d => d.day === dayOfWeek);
        if (daySchedule) {
          const slot = daySchedule.slots.find(s => `${s.startTime} - ${s.endTime}` === slotStr);
          if (slot) {
            slot.isBooked = true;
            profile.markModified('availability');
            await profile.save();
          }
        }
      }
    };

    // 1. sarah + evelyn (Upcoming)
    await markSlotBooked(therapists[0]._id, appointmentDates[0], '10:00 AM - 11:00 AM');
    appointments.push(
      await new Appointment({
        clientId: clients[0]._id,
        therapistId: therapists[0]._id,
        therapistProfileId: therapistProfiles[0]._id,
        sessionType: 'chat',
        date: appointmentDates[0],
        timeSlot: '10:00 AM - 11:00 AM',
        status: 'upcoming',
        fee: therapistProfiles[0].sessionFee,
        paymentStatus: 'paid'
      }).save()
    );

    // 2. david + james (Upcoming)
    await markSlotBooked(therapists[1]._id, appointmentDates[1], '02:00 PM - 03:00 PM');
    appointments.push(
      await new Appointment({
        clientId: clients[1]._id,
        therapistId: therapists[1]._id,
        therapistProfileId: therapistProfiles[1]._id,
        sessionType: 'video',
        date: appointmentDates[1],
        timeSlot: '02:00 PM - 03:00 PM',
        status: 'upcoming',
        fee: therapistProfiles[1].sessionFee,
        paymentStatus: 'paid'
      }).save()
    );

    // 3. elena + aarav (Upcoming)
    await markSlotBooked(therapists[2]._id, appointmentDates[2], '11:00 AM - 12:00 PM');
    appointments.push(
      await new Appointment({
        clientId: clients[2]._id,
        therapistId: therapists[2]._id,
        therapistProfileId: therapistProfiles[2]._id,
        sessionType: 'chat',
        date: appointmentDates[2],
        timeSlot: '11:00 AM - 12:00 PM',
        status: 'upcoming',
        fee: therapistProfiles[2].sessionFee,
        paymentStatus: 'paid'
      }).save()
    );

    // 4. sarah + maya (Upcoming)
    await markSlotBooked(therapists[3]._id, appointmentDates[3], '03:00 PM - 04:00 PM');
    appointments.push(
      await new Appointment({
        clientId: clients[0]._id,
        therapistId: therapists[3]._id,
        therapistProfileId: therapistProfiles[3]._id,
        sessionType: 'video',
        date: appointmentDates[3],
        timeSlot: '03:00 PM - 04:00 PM',
        status: 'upcoming',
        fee: therapistProfiles[3].sessionFee,
        paymentStatus: 'paid'
      }).save()
    );

    // 5. sarah + evelyn (Completed)
    appointments.push(
      await new Appointment({
        clientId: clients[0]._id,
        therapistId: therapists[0]._id,
        therapistProfileId: therapistProfiles[0]._id,
        sessionType: 'chat',
        date: appointmentDates[4],
        timeSlot: '10:00 AM - 11:00 AM',
        status: 'completed',
        sessionNotes: 'Sarah displayed great progress in managing workplace triggers. Practiced breathing exercises.',
        fee: therapistProfiles[0].sessionFee,
        paymentStatus: 'paid'
      }).save()
    );

    // 6. david + aarav (Completed)
    appointments.push(
      await new Appointment({
        clientId: clients[1]._id,
        therapistId: therapists[2]._id,
        therapistProfileId: therapistProfiles[2]._id,
        sessionType: 'chat',
        date: appointmentDates[5],
        timeSlot: '03:00 PM - 04:00 PM',
        status: 'completed',
        sessionNotes: 'Discussed ADHD medication schedule and morning task lists. Focus remains steady.',
        fee: therapistProfiles[2].sessionFee,
        paymentStatus: 'paid'
      }).save()
    );

    // 7. elena + maya (Completed)
    appointments.push(
      await new Appointment({
        clientId: clients[2]._id,
        therapistId: therapists[3]._id,
        therapistProfileId: therapistProfiles[3]._id,
        sessionType: 'video',
        date: appointmentDates[6],
        timeSlot: '09:00 AM - 10:00 AM',
        status: 'completed',
        sessionNotes: 'Grief session regarding bereavement. Emotional expression encouraged.',
        fee: therapistProfiles[3].sessionFee,
        paymentStatus: 'paid'
      }).save()
    );

    // 8. david + sofia (Completed)
    appointments.push(
      await new Appointment({
        clientId: clients[1]._id,
        therapistId: therapists[4]._id,
        therapistProfileId: therapistProfiles[4]._id,
        sessionType: 'chat',
        date: appointmentDates[7],
        timeSlot: '04:00 PM - 05:00 PM',
        status: 'completed',
        sessionNotes: 'Conducted exposure exercises for elevator phobia. Client showed moderate anxiety levels.',
        fee: therapistProfiles[4].sessionFee,
        paymentStatus: 'paid'
      }).save()
    );

    // 9. elena + evelyn (Upcoming)
    await markSlotBooked(therapists[0]._id, appointmentDates[8], '04:00 PM - 05:00 PM');
    appointments.push(
      await new Appointment({
        clientId: clients[2]._id,
        therapistId: therapists[0]._id,
        therapistProfileId: therapistProfiles[0]._id,
        sessionType: 'video',
        date: appointmentDates[8],
        timeSlot: '04:00 PM - 05:00 PM',
        status: 'upcoming',
        fee: therapistProfiles[0].sessionFee,
        paymentStatus: 'paid'
      }).save()
    );

    // 10. sarah + james (Cancelled)
    appointments.push(
      await new Appointment({
        clientId: clients[0]._id,
        therapistId: therapists[1]._id,
        therapistProfileId: therapistProfiles[1]._id,
        sessionType: 'video',
        date: appointmentDates[9],
        timeSlot: '11:00 AM - 12:00 PM',
        status: 'cancelled',
        fee: therapistProfiles[1].sessionFee,
        paymentStatus: 'pending'
      }).save()
    );

    console.log('Seeded 10 Appointments (Upcoming, Completed, Cancelled).');

    // 5. Create Messages (20 messages)
    // We will place all 20 messages inside Sarah & Dr. Evelyn's completed session (appointments[4]).
    const chatAppId = appointments[4]._id;
    const clientUserObj = clients[0];
    const therapistUserObj = therapists[0];

    const dialog = [
      { sender: clientUserObj, text: 'Hello Doctor, I hope you are having a nice week.' },
      { sender: therapistUserObj, text: 'Hello Sarah! Yes, thank you. How are you feeling today?' },
      { sender: clientUserObj, text: 'I have been feeling a bit overwhelmed at my new job lately.' },
      { sender: therapistUserObj, text: 'I understand. Workplace transitions can trigger high stress. Can you tell me what specific situations bring this out?' },
      { sender: clientUserObj, text: 'Mainly during team presentations. I get nervous and my heart starts beating really fast.' },
      { sender: therapistUserObj, text: 'That is a very common physical response to performance anxiety. It is your body going into fight-or-flight.' },
      { sender: clientUserObj, text: 'Is there any way to calm it down in the moment?' },
      { sender: therapistUserObj, text: 'Absolutely. We can use the box breathing technique. Let us try it now. Inhale for 4 seconds, hold for 4, exhale for 4, hold for 4.' },
      { sender: clientUserObj, text: 'Okay, I am trying that now...' },
      { sender: clientUserObj, text: 'Wow, it actually helps to bring down the speed of my heart.' },
      { sender: therapistUserObj, text: 'Excellent! Box breathing sends a signal to your nervous system that you are safe.' },
      { sender: clientUserObj, text: 'I will definitely practice this before my next meeting.' },
      { sender: therapistUserObj, text: 'I highly recommend that. Let us also explore the underlying thought: what are you afraid will happen during presentations?' },
      { sender: clientUserObj, text: 'I am afraid that I will forget my words and people will think I am incompetent.' },
      { sender: therapistUserObj, text: 'Ah, so that is a cognitive distortion called catastrophizing. We assume the absolute worst outcome.' },
      { sender: clientUserObj, text: 'Yes, I do that a lot. How do I stop that?' },
      { sender: therapistUserObj, text: 'We challenge it. Is it true you have forgotten everything in past presentations?' },
      { sender: clientUserObj, text: 'No, usually they go quite well, even if I get anxious.' },
      { sender: therapistUserObj, text: 'Correct! So the evidence shows you are capable. Remind yourself of this facts when the fear hits.' },
      { sender: clientUserObj, text: 'Thank you Doctor. I feel much lighter now. Appreciate your help.' }
    ];

    for (const msg of dialog) {
      const receiver = msg.sender._id.equals(clientUserObj._id) ? therapistUserObj : clientUserObj;
      await new Message({
        appointmentId: chatAppId,
        senderId: msg.sender._id,
        receiverId: receiver._id,
        content: msg.text,
        isRead: true
      }).save();
    }
    console.log('Seeded 20 Messages in Sarah & Dr. Evelyn Carter’s chat session.');

    // 6. Seed Reviews (For completed sessions)
    const reviewData = [
      {
        clientId: clients[0]._id,
        therapistId: therapists[0]._id,
        appointmentId: appointments[4]._id,
        rating: 5,
        comment: 'Dr. Evelyn is absolutely wonderful. Her advice on box breathing helped me manage my anxiety during a major presentation. Highly recommended!'
      },
      {
        clientId: clients[1]._id,
        therapistId: therapists[2]._id,
        appointmentId: appointments[5]._id,
        rating: 4,
        comment: 'Aarav is very practical. The task checklists we drew up really helped me focus this week. Very good therapist.'
      },
      {
        clientId: clients[2]._id,
        therapistId: therapists[3]._id,
        appointmentId: appointments[6]._id,
        rating: 5,
        comment: 'Maya was incredibly warm and empathetic. She helped me process my grief in a safe, non-judgmental environment.'
      }
    ];

    for (const rev of reviewData) {
      await new Review(rev).save();

      // Update ratings
      const allReviews = await Review.find({ therapistId: rev.therapistId });
      const totalReviews = allReviews.length;
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

      const profile = await TherapistProfile.findOne({ userId: rev.therapistId });
      if (profile) {
        profile.rating = avgRating;
        profile.totalReviews = totalReviews;
        await profile.save();
      }
    }
    console.log('Seeded 3 Reviews and updated Therapist ratings.');

    // 7. Seed MoodJournal (Historical last 10 days for Sarah)
    for (let i = 9; i >= 0; i--) {
      const logDate = new Date();
      logDate.setDate(logDate.getDate() - i);

      const moodOptions = ['great', 'good', 'okay', 'low', 'bad'];
      const notes = [
        'Had a productive day at work. Presenting went well.',
        'Felt calm, practiced breathing techniques.',
        'Routine day, felt okay.',
        'Stressed about upcoming deadline.',
        'Woke up with an anxious stomach today.',
        'Felt tired but generally okay.',
        'Wonderful weekend, spent time with friends.',
        'Reflecting on therapy session, feeling motivated.',
        'Felt very happy, got positive feedback.',
        'Feeling peaceful today.'
      ];

      const moods = ['great', 'good', 'okay', 'low', 'low', 'okay', 'great', 'good', 'great', 'good'];

      await new MoodJournal({
        clientId: clients[0]._id,
        mood: moods[9 - i],
        note: notes[9 - i],
        date: logDate
      }).save();
    }
    console.log('Seeded Mood logs for Sarah Jenkins.');

    console.log('Database Seeding Completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding encountered an error:', error);
    process.exit(1);
  }
};

seedData();
