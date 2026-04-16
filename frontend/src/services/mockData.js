export function buildInitialState() {
  return {
    admins: [
      {
        id: 'admin-1',
        fullName: 'Nadine Perera',
        email: 'admin@smartcare.com',
        password: 'Admin1234',
        accessKey: 'SMARTCARE-ADMIN',
        role: 'admin',
        title: 'Platform Administrator'
      }
    ],
    doctors: [
      {
        id: 'doc-1',
        fullName: 'Dr. Nithu Senanayake',
        email: 'doctor@smartcare.com',
        password: 'Doctor1234',
        specialization: 'Cardiology',
        licenseNumber: 'MED-56789',
        experience: 8,
        hospital: 'SmartCare City Clinic',
        phone: '+94 77 123 4567',
        bio: 'Experienced cardiologist with a focus on tele-consultations and preventive care.',
        profileImage: '',
        status: 'approved',
        submittedDate: '2026-04-10T09:00:00.000Z',
        role: 'doctor'
      },
      {
        id: 'doc-2',
        fullName: 'Dr. Ashani Fernando',
        email: 'ashani@smartcare.com',
        password: 'Doctor1234',
        specialization: 'Dermatology',
        licenseNumber: 'MED-77812',
        experience: 5,
        hospital: 'Northside Medical Center',
        phone: '+94 71 555 1234',
        bio: 'Dermatology specialist supporting digital review workflows.',
        profileImage: '',
        status: 'pending',
        submittedDate: '2026-04-14T11:00:00.000Z',
        role: 'doctor'
      }
    ],
    availability: [
      {
        id: 'slot-1',
        doctorId: 'doc-1',
        date: '2026-04-18',
        startTime: '09:00',
        endTime: '11:00',
        consultationType: 'Online',
        location: 'Telemedicine Room A',
        status: 'Open'
      },
      {
        id: 'slot-2',
        doctorId: 'doc-1',
        date: '2026-04-19',
        startTime: '14:00',
        endTime: '17:00',
        consultationType: 'Both',
        location: 'SmartCare City Clinic',
        status: 'Open'
      }
    ],
    appointments: [
      {
        id: 'apt-101',
        doctorId: 'doc-1',
        patientId: 'pat-300',
        patientName: 'John Carter',
        appointmentDate: '2026-04-18',
        time: '09:30',
        reason: 'Chest pain follow-up',
        consultationType: 'Online',
        status: 'pending'
      },
      {
        id: 'apt-102',
        doctorId: 'doc-1',
        patientId: 'pat-301',
        patientName: 'Maria Lopez',
        appointmentDate: '2026-04-18',
        time: '10:15',
        reason: 'Medication review',
        consultationType: 'Physical',
        status: 'confirmed'
      }
    ],
    telemedicineSessions: [
      {
        id: 'tm-1',
        doctorId: 'doc-1',
        patientName: 'John Carter',
        appointmentInfo: 'April 18, 2026 at 9:30 AM',
        status: 'Ready',
        provider: 'Jitsi-ready',
        quickNotes: 'Review ECG summary before call.'
      }
    ],
    prescriptions: [
      {
        id: 'rx-1',
        doctorId: 'doc-1',
        patientId: 'pat-301',
        patientName: 'Maria Lopez',
        date: '2026-04-15',
        diagnosis: 'Hypertension review',
        medicines: [
          {
            name: 'Amlodipine',
            dosage: '5mg',
            frequency: 'Once daily',
            duration: '30 days',
            instructions: 'After breakfast'
          }
        ],
        notes: 'Monitor blood pressure twice weekly.',
        followUpDate: '2026-05-02'
      }
    ],
    reports: [
      {
        id: 'rep-1',
        doctorId: 'doc-1',
        patientName: 'John Carter',
        category: 'lab report',
        fileType: 'PDF',
        uploadDate: '2026-04-16',
        fileName: 'cardiac-panel-results.pdf',
        summary: 'Cardiac markers and cholesterol profile'
      },
      {
        id: 'rep-2',
        doctorId: 'doc-1',
        patientName: 'Maria Lopez',
        category: 'scan report',
        fileType: 'Image',
        uploadDate: '2026-04-14',
        fileName: 'echo-scan.png',
        summary: 'Echo scan upload for doctor review'
      }
    ]
  };
}
