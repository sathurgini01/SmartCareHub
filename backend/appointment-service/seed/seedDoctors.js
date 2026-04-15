const Doctor = require('../models/Doctor');

const mockDoctors = [
  {
    name: 'Dr. Ashan Fernando',
    email: 'ashan.fernando@healthcare.lk',
    specialty: 'Cardiology',
    qualifications: ['MBBS', 'MD (Cardiology)', 'MRCP (UK)'],
    experience: 15,
    consultationFee: 3500,
    currency: 'LKR',
    rating: 4.8,
    totalReviews: 142,
    hospital: 'National Hospital Colombo',
    bio: 'Senior Consultant Cardiologist with 15+ years of experience in interventional cardiology and cardiac care.',
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '13:00', slotDuration: 30 },
      { day: 'Wednesday', startTime: '09:00', endTime: '13:00', slotDuration: 30 },
      { day: 'Friday', startTime: '14:00', endTime: '18:00', slotDuration: 30 }
    ]
  },
  {
    name: 'Dr. Nimali Perera',
    email: 'nimali.perera@healthcare.lk',
    specialty: 'Dermatology',
    qualifications: ['MBBS', 'MD (Dermatology)'],
    experience: 10,
    consultationFee: 2500,
    currency: 'LKR',
    rating: 4.6,
    totalReviews: 98,
    hospital: 'Lanka Hospitals',
    bio: 'Specialist in skin conditions, cosmetic dermatology and laser treatments.',
    availability: [
      { day: 'Monday', startTime: '10:00', endTime: '16:00', slotDuration: 20 },
      { day: 'Tuesday', startTime: '10:00', endTime: '16:00', slotDuration: 20 },
      { day: 'Thursday', startTime: '10:00', endTime: '16:00', slotDuration: 20 }
    ]
  },
  {
    name: 'Dr. Kamal Jayasinghe',
    email: 'kamal.jayasinghe@healthcare.lk',
    specialty: 'Neurology',
    qualifications: ['MBBS', 'MD (Neurology)', 'FRCP'],
    experience: 20,
    consultationFee: 4000,
    currency: 'LKR',
    rating: 4.9,
    totalReviews: 210,
    hospital: 'Asiri Hospital',
    bio: 'Leading Neurologist specializing in stroke management, epilepsy, and neurodegenerative disorders.',
    availability: [
      { day: 'Tuesday', startTime: '08:00', endTime: '12:00', slotDuration: 30 },
      { day: 'Thursday', startTime: '08:00', endTime: '12:00', slotDuration: 30 },
      { day: 'Saturday', startTime: '09:00', endTime: '13:00', slotDuration: 30 }
    ]
  },
  {
    name: 'Dr. Priyantha Silva',
    email: 'priyantha.silva@healthcare.lk',
    specialty: 'Orthopedics',
    qualifications: ['MBBS', 'MS (Orthopedics)'],
    experience: 12,
    consultationFee: 3000,
    currency: 'LKR',
    rating: 4.5,
    totalReviews: 87,
    hospital: 'Durdans Hospital',
    bio: 'Orthopedic surgeon experienced in joint replacements, sports injuries, and fracture management.',
    availability: [
      { day: 'Monday', startTime: '14:00', endTime: '18:00', slotDuration: 30 },
      { day: 'Wednesday', startTime: '14:00', endTime: '18:00', slotDuration: 30 },
      { day: 'Friday', startTime: '09:00', endTime: '13:00', slotDuration: 30 }
    ]
  },
  {
    name: 'Dr. Sachini Wickramasinghe',
    email: 'sachini.w@healthcare.lk',
    specialty: 'Pediatrics',
    qualifications: ['MBBS', 'DCH', 'MD (Pediatrics)'],
    experience: 8,
    consultationFee: 2000,
    currency: 'LKR',
    rating: 4.7,
    totalReviews: 165,
    hospital: 'Lady Ridgeway Hospital',
    bio: 'Dedicated Pediatrician caring for children from newborns to adolescents with expertise in childhood infections and nutrition.',
    availability: [
      { day: 'Monday', startTime: '08:00', endTime: '14:00', slotDuration: 20 },
      { day: 'Wednesday', startTime: '08:00', endTime: '14:00', slotDuration: 20 },
      { day: 'Friday', startTime: '08:00', endTime: '14:00', slotDuration: 20 },
      { day: 'Saturday', startTime: '09:00', endTime: '12:00', slotDuration: 20 }
    ]
  },
  {
    name: 'Dr. Ruwan Dissanayake',
    email: 'ruwan.d@healthcare.lk',
    specialty: 'General Medicine',
    qualifications: ['MBBS', 'MD (Internal Medicine)'],
    experience: 18,
    consultationFee: 1500,
    currency: 'LKR',
    rating: 4.4,
    totalReviews: 320,
    hospital: 'Nawaloka Hospital',
    bio: 'Senior Physician with broad expertise in general medicine, diabetes management, and preventive healthcare.',
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00', slotDuration: 15 },
      { day: 'Tuesday', startTime: '09:00', endTime: '17:00', slotDuration: 15 },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00', slotDuration: 15 },
      { day: 'Thursday', startTime: '09:00', endTime: '17:00', slotDuration: 15 },
      { day: 'Friday', startTime: '09:00', endTime: '17:00', slotDuration: 15 }
    ]
  },
  {
    name: 'Dr. Malini Rajapakse',
    email: 'malini.r@healthcare.lk',
    specialty: 'Gynecology',
    qualifications: ['MBBS', 'MS (Obstetrics & Gynecology)', 'FRCOG'],
    experience: 22,
    consultationFee: 3500,
    currency: 'LKR',
    rating: 4.8,
    totalReviews: 195,
    hospital: 'Asiri Surgical Hospital',
    bio: 'Consultant Obstetrician & Gynecologist with expertise in high-risk pregnancies and minimally invasive gynecological surgery.',
    availability: [
      { day: 'Tuesday', startTime: '09:00', endTime: '14:00', slotDuration: 30 },
      { day: 'Thursday', startTime: '09:00', endTime: '14:00', slotDuration: 30 },
      { day: 'Saturday', startTime: '10:00', endTime: '13:00', slotDuration: 30 }
    ]
  },
  {
    name: 'Dr. Tharindu Bandara',
    email: 'tharindu.b@healthcare.lk',
    specialty: 'ENT',
    qualifications: ['MBBS', 'MS (ENT)'],
    experience: 7,
    consultationFee: 2500,
    currency: 'LKR',
    rating: 4.3,
    totalReviews: 56,
    hospital: 'Hemas Hospital',
    bio: 'ENT Surgeon specializing in sinus surgery, hearing disorders, and pediatric ENT conditions.',
    availability: [
      { day: 'Monday', startTime: '10:00', endTime: '15:00', slotDuration: 20 },
      { day: 'Wednesday', startTime: '10:00', endTime: '15:00', slotDuration: 20 },
      { day: 'Friday', startTime: '10:00', endTime: '15:00', slotDuration: 20 }
    ]
  },
  {
    name: 'Dr. Chaminda Samarakoon',
    email: 'chaminda.s@healthcare.lk',
    specialty: 'Ophthalmology',
    qualifications: ['MBBS', 'DO', 'MS (Ophthalmology)'],
    experience: 14,
    consultationFee: 3000,
    currency: 'LKR',
    rating: 4.6,
    totalReviews: 112,
    hospital: 'Eye Hospital Colombo',
    bio: 'Eye surgeon with specialization in cataract surgery, glaucoma management, and retinal disorders.',
    availability: [
      { day: 'Tuesday', startTime: '08:00', endTime: '13:00', slotDuration: 20 },
      { day: 'Thursday', startTime: '08:00', endTime: '13:00', slotDuration: 20 },
      { day: 'Saturday', startTime: '08:00', endTime: '12:00', slotDuration: 20 }
    ]
  },
  {
    name: 'Dr. Iresha Gunawardena',
    email: 'iresha.g@healthcare.lk',
    specialty: 'Psychiatry',
    qualifications: ['MBBS', 'MD (Psychiatry)'],
    experience: 11,
    consultationFee: 3500,
    currency: 'LKR',
    rating: 4.7,
    totalReviews: 78,
    hospital: 'National Institute of Mental Health',
    bio: 'Consultant Psychiatrist with focus on anxiety disorders, depression, and cognitive behavioral therapy.',
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '15:00', slotDuration: 45 },
      { day: 'Wednesday', startTime: '09:00', endTime: '15:00', slotDuration: 45 },
      { day: 'Friday', startTime: '09:00', endTime: '13:00', slotDuration: 45 }
    ]
  },
  {
    name: 'Dr. Nishantha Kumara',
    email: 'nishantha.k@healthcare.lk',
    specialty: 'Dental',
    qualifications: ['BDS', 'MS (Oral Surgery)'],
    experience: 9,
    consultationFee: 2000,
    currency: 'LKR',
    rating: 4.5,
    totalReviews: 134,
    hospital: 'Dental Institute Colombo',
    bio: 'Dental Surgeon specializing in cosmetic dentistry, root canal treatments, and dental implants.',
    availability: [
      { day: 'Monday', startTime: '08:00', endTime: '16:00', slotDuration: 30 },
      { day: 'Tuesday', startTime: '08:00', endTime: '16:00', slotDuration: 30 },
      { day: 'Wednesday', startTime: '08:00', endTime: '16:00', slotDuration: 30 },
      { day: 'Thursday', startTime: '08:00', endTime: '16:00', slotDuration: 30 },
      { day: 'Friday', startTime: '08:00', endTime: '14:00', slotDuration: 30 }
    ]
  },
  {
    name: 'Dr. Dilshan Amarasinghe',
    email: 'dilshan.a@healthcare.lk',
    specialty: 'Cardiology',
    qualifications: ['MBBS', 'MD (Cardiology)'],
    experience: 6,
    consultationFee: 3000,
    currency: 'LKR',
    rating: 4.3,
    totalReviews: 45,
    hospital: 'Lanka Hospitals',
    bio: 'Young and dynamic Cardiologist with expertise in echocardiography and preventive cardiology.',
    availability: [
      { day: 'Tuesday', startTime: '14:00', endTime: '18:00', slotDuration: 30 },
      { day: 'Thursday', startTime: '14:00', endTime: '18:00', slotDuration: 30 },
      { day: 'Saturday', startTime: '09:00', endTime: '14:00', slotDuration: 30 }
    ]
  }
];

const seedDoctors = async () => {
  try {
    const count = await Doctor.countDocuments();
    
    if (count === 0) {
      console.log('🌱 Seeding mock doctor data...');
      await Doctor.insertMany(mockDoctors);
      console.log(`✅ ${mockDoctors.length} doctors seeded successfully`);
    } else {
      console.log(`ℹ️  Database already has ${count} doctors, skipping seed`);
    }
  } catch (error) {
    console.error('❌ Seed error:', error.message);
  }
};

module.exports = seedDoctors;
