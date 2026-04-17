import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import doctorService from '../services/doctorService';
import { formatCurrency, getSpecialtyIcon } from '../utils/formatters';
import { FiSearch, FiFilter, FiStar, FiClock, FiMapPin, FiArrowRight } from 'react-icons/fi';
import './BrowseDoctors.css';

const BrowseDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || '');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    fetchSpecialties();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [specialty, sortBy]);

  const fetchSpecialties = async () => {
    try {
      const res = await doctorService.getSpecialties();
      if (res.data.success) setSpecialties(res.data.data);
    } catch (err) {
      console.error('Failed to fetch specialties:', err);
    }
  };

  const fetchDoctors = async () => {
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
  };

  const handleSearch = (e) => {
    e.preventDefault();
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
                      <span>{doctor.rating.toFixed(1)}</span>
                      <span className="review-count">({doctor.totalReviews})</span>
                    </div>
                  </div>

                  <div className="doctor-details">
                    <div className="detail-item">
                      <FiMapPin size={14} />
                      <span>{doctor.hospital}</span>
                    </div>
                    <div className="detail-item">
                      <FiClock size={14} />
                      <span>{doctor.experience} years experience</span>
                    </div>
                  </div>

                  <p className="doctor-bio">{doctor.bio}</p>

                  <div className="doctor-qualifications">
                    {doctor.qualifications.map((q, i) => (
                      <span key={i} className="qual-tag">{q}</span>
                    ))}
                  </div>

                  <div className="doctor-card-footer">
                    <div className="doctor-fee">
                      <span className="fee-label">Consultation</span>
                      <span className="fee-amount">{formatCurrency(doctor.consultationFee)}</span>
                    </div>
                    <Link to={`/book-appointment/${doctor._id}`} className="btn btn-primary">
                      Book Now <FiArrowRight />
                    </Link>
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
