import React from "react";
import "./FilterBar.css";

export default function FilterBar({
  search, setSearch,
  searchId, setSearchId,
  selectedClass, setSelectedClass,
  classes,
  selectedVillage, setSelectedVillage,
  villages,
  selectedBus, setSelectedBus,
  buses,
  hostel, setHostel,
  dueMin, setDueMin,
  dueMax, setDueMax,
  resetFilters
}) {
  return (
    <div className="dash-filters">
      <label>
        Name/Father
        <input
          className="filter-input"
          placeholder="🔍 Search by name or father name"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </label>
      <label>
        ID Number
        <input
          className="filter-input"
          placeholder="Search by ID"
          value={searchId}
          onChange={e => setSearchId(e.target.value)}
          type="text"
        />
      </label>
      <label>
        Class
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
          {classes.map(c => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label>
        Village
        <select value={selectedVillage} onChange={e => setSelectedVillage(e.target.value)}>
          {villages.map(v => <option key={v}>{v}</option>)}
        </select>
      </label>
      <label>
        Bus
        <select value={selectedBus} onChange={e => setSelectedBus(e.target.value)}>
          {buses.map(b => <option key={b}>{b}</option>)}
        </select>
      </label>
      <label>
        Hostel
        <select value={hostel} onChange={e => setHostel(e.target.value)}>
          <option>All</option>
          <option>Hosteler</option>
          <option>Dayscholar</option>
        </select>
      </label>
      <label>
        Due Min
        <input
          type="number"
          className="filter-input"
          placeholder="Due Min"
          value={dueMin}
          onChange={e => setDueMin(e.target.value)}
        />
      </label>
      <label>
        Due Max
        <input
          type="number"
          className="filter-input"
          placeholder="Due Max"
          value={dueMax}
          onChange={e => setDueMax(e.target.value)}
        />
      </label>
      <button className="filter-reset-btn" onClick={resetFilters}>Reset</button>
    </div>
  );
}
