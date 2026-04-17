import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import doctorService from '../services/doctorService';
import { formatCurrency, getSpecialtyIcon } from '../utils/formatters';
import { FiSearch, FiFilter, FiStar, FiClock, FiMapPin, FiArrowRight, FiCalendar, FiFileText, FiMail, FiPhone, FiUser } from 'react-icons/fi';
import './BrowseDoctors.css';

const showValue = (value, fallback) => value || fallback;

const BrowseDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || '');
  const [sortBy, setSortBy] = useState('rating');

  const fetchSpecialties = async () => {
    try {
      const res = await doctorService.getSpecialties();
      if (res.data.success) setSpecialties(res.data.data);
    } catch (err) {
      console.error('Failed to fetch specialties:', err);
    }
  };

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sortBy, limit: 50 };
      if (specialty) params.specialty = specialty;
      if (search) params.search = search;
      
      const res = await doctorService.getAll(params);
      if (res.data.success) setDoctors(res.data.data);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    }
    setLoading(false);
  }, [search, sortBy, specialty]);

  useEffect(() => {
    fetchSpecialties();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleSearch = (e) => {
    e.preventDefault();
    const nextParams = {};
    if (search.trim()) nextParams.search = search.trim();
    if (specialty) nextParams.specialty = specialty;
    setSearchParams(nextParams);
    fetchDoctors();
  };

  return (
    <div className="browse-doctors page-wrapper">
      <div className="container">
        <div className="page-header animate-slideUp">
          <h1>Find a Doctor</h1>
          <p>Browse our expert doctors and book an appointment today</p>
        </div>

        {/* Search & Filters */}
        <div className="doctors-filters card animate-fadeIn">
          <form onSubmit={handleSearch} className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search by doctor name, specialty, or hospital..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div className="filter-row">
            <div className="filter-group">
              <label><FiFilter size={14} /> Specialty</label>
              <select
                className="form-select"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              >
                <option value="">All Specialties</option>
                {specialties.map(s => (
                  <option key={s.name} value={s.name}>{s.name} ({s.count})</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Sort By</label>
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="rating">Top Rated</option>
                <option value="experience">Most Experienced</option>
                <option value="fee">Lowest Fee</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="spinner-overlay"><div className="spinner"></div></div>
        ) : doctors.length === 0 ? (
          <div className="empty-state">
            <h3>No doctors found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <p className="results-count">{doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found</p>
            <div className="doctors-grid stagger-children">
              {doctors.map((doctor) => (
                <div key={doctor._id} className="doctor-card card animate-fadeIn">
                  <div className="doctor-card-header">
                    <div className="doctor-avatar-lg">
                      {doctor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="doctor-header-info">
                      <h3>{doctor.name}</h3>
                      <p className="doctor-specialty">
                        {getSpecialtyIcon(doctor.specialty)} {doctor.specialty}
                      </p>
                    </div>
                    <div className="doctor-rating">
                      <FiStar className="star-icon" />
                      <span>{doctor.rating?.toFixed?.(1) || '4.0'}</span>
                      <span className="review-count">({doctor.totalReviews || 0})</span>
                    </div>
                  </div>

                  <div className="doctor-details">
                    <div className="detail-item">
                      <FiMapPin size={14} />
                      <span>{doctor.hospital || 'Hospital details not added yet'}</span>
                    </div>
                    <div className="detail-item">
                      <FiClock size={14} />
                      <span>{doctor.experience || 0} years experience</span>
                    </div>
                  </div>

                  <p className="doctor-bio">
                    {doctor.bio || 'This doctor profile is active and available for patient appointment bookings.'}
                  </p>

                  <div className="doctor-info-stack">
                    <div className="doctor-info-block">
                      <div className="doctor-info-title">
                        <FiUser size={14} />
                        <span>Doctor Profile</span>
                      </div>
                      <div className="doctor-profile-list">
                        <div className="profile-detail-row">
                          <span className="profile-label">Role</span>
                          <span className="profile-value">{showValue(doctor.role, 'doctor')}</span>
                        </div>
                        <div className="profile-detail-row">
                          <span className="profile-label">Status</span>
                          <span className="profile-value">{showValue(doctor.status, 'approved')}</span>
                        </div>
                        <div className="profile-detail-row">
                          <span className="profile-label">Title</span>
                          <span className="profile-value">{showValue(doctor.title, 'Consultant Doctor')}</span>
                        </div>
                        <div className="profile-detail-row">
                          <span className="profile-label">Email</span>
                          <span className="profile-value with-icon">
                            <FiMail size={13} />
                            {showValue(doctor.email, 'Email not added yet')}
                          </span>
                        </div>
                        <div className="profile-detail-row">
                          <span className="profile-label">Phone</span>
                          <span className="profile-value with-icon">
                            <FiPhone size={13} />
                            {showValue(doctor.phone, 'Phone not added yet')}
                          </span>
                        </div>
                        <div className="profile-detail-row">
                          <span className="profile-label">License</span>
                          <span className="profile-value with-icon">
                            <FiFileText size={13} />
                            {showValue(doctor.licenseNumber || doctor.qualifications?.[0], 'License not added yet')}
                          </span>
                        </div>
                        <div className="profile-status-row">
                          <span className="profile-status-chip">
                            {(doctor.role || 'doctor')} • {(doctor.status || 'approved')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="doctor-info-block">
                      <div className="doctor-info-title">
                        <FiFileText size={14} />
                        <span>Qualifications</span>
                      </div>
                      <div className="doctor-qualifications">
                        {doctor.qualifications?.length ? (
                          doctor.qualifications.map((q, i) => (
                            <span key={i} className="qual-tag">{q}</span>
                          ))
                        ) : (
                          <span className="doctor-muted-copy">Qualification details will be updated soon</span>
                        )}
                      </div>
                    </div>

                    <div className="doctor-info-block">
                      <div className="doctor-info-title">
                        <FiCalendar size={14} />
                        <span>Available Days</span>
                      </div>
                      {doctor.availability?.length ? (
                        <div className="doctor-availability-grid">
                          {doctor.availability.slice(0, 4).map((slot, index) => (
                            <div key={`${doctor._id}-slot-${index}`} className="availability-chip">
                              <strong>{slot.day}</strong>
                              <span>{slot.startTime} - {slot.endTime}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="doctor-muted-copy">Availability not added yet. Patients can still open the booking page.</p>
                      )}
                    </div>
                  </div>

                  <div className="doctor-card-footer">
                    <div className="doctor-fee">
                      <span className="fee-label">Consultation</span>
                      <span className="fee-amount">{formatCurrency(doctor.consultationFee || 2500)}</span>
                    </div>
                    <div className="doctor-card-actions">
                      <Link to={`/book/${doctor._id}`} className="btn btn-primary">
                        Book Appointment <FiArrowRight />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BrowseDoctors;
