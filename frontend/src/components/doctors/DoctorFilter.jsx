import React from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';

const DoctorFilter = ({ search, setSearch, specialty, setSpecialty, specialties, sortBy, setSortBy, onSearch }) => (
  <div className="doctors-filters card animate-fadeIn">
    <form onSubmit={onSearch} className="search-bar">
      <FiSearch className="search-icon" />
      <input type="text" className="form-input" placeholder="Search by name or hospital..." value={search} onChange={e => setSearch(e.target.value)} />
      <button type="submit" className="btn btn-primary">Search</button>
    </form>
    <div className="filter-row">
      <div className="filter-group">
        <label><FiFilter size={14} /> Specialty</label>
        <select className="form-select" value={specialty} onChange={e => setSpecialty(e.target.value)}>
          <option value="">All Specialties</option>
          {specialties.map(s => <option key={s.name} value={s.name}>{s.name} ({s.count})</option>)}
        </select>
      </div>
      <div className="filter-group">
        <label>Sort By</label>
        <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="rating">Top Rated</option>
          <option value="experience">Most Experienced</option>
          <option value="fee">Lowest Fee</option>
        </select>
      </div>
    </div>
  </div>
);
export default DoctorFilter;
