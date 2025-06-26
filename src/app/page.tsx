
'use client';

import { useEffect, useState } from 'react';
import EmployeeCard from '@/app/components/EmployeeCard';
import SearchFilter from '@/app/components/SearchFilter';
import { fetchEmployees } from '@/app/lib/api';
import { useBookmarkStore } from '@/app/store/bookmarksStore';
import type { Employee } from '@/app/types';

export default function HRDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState<number[]>([]);

  // Zustand bookmark store
  const { bookmarks, addBookmark, removeBookmark } = useBookmarkStore();

  // Fetch employees on mount
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await fetchEmployees();
        setEmployees(data);
        setFilteredEmployees(data);
      } catch (err) {
        setError('Failed to load employee data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadEmployees();
  }, []);

  // Apply filters whenever search or filters change
  useEffect(() => {
    let results = [...employees];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(emp => 
        emp.firstName.toLowerCase().includes(term) ||
        emp.lastName.toLowerCase().includes(term) ||
        emp.email.toLowerCase().includes(term) ||
        emp.department.toLowerCase().includes(term)
      );
    }
    
    // Department filter
    if (departmentFilter.length > 0) {
      results = results.filter(emp => 
        departmentFilter.includes(emp.department)
      );
    }
    
    // Rating filter
    if (ratingFilter.length > 0) {
      results = results.filter(emp => 
        ratingFilter.includes(emp.performanceRating)
      );
    }
    
    setFilteredEmployees(results);
  }, [searchTerm, departmentFilter, ratingFilter, employees]);

  // Bookmark toggle handler
  const handleBookmark = (employee: Employee) => {
    const isBookmarked = bookmarks.some(b => b.id === employee.id);
    isBookmarked ? removeBookmark(employee.id) : addBookmark(employee);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">HR Performance Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Search and Filter Section */}
          <SearchFilter 
            onSearch={setSearchTerm}
            onDepartmentFilter={setDepartmentFilter}
            onRatingFilter={setRatingFilter}
          />

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Total Employees</p>
              <p className="text-2xl font-bold">{employees.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Filtered Results</p>
              <p className="text-2xl font-bold">{filteredEmployees.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Bookmarked</p>
              <p className="text-2xl font-bold">{bookmarks.length}</p>
            </div>
          </div>

          {/* Employee Grid */}
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 text-lg">No employees match your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map((employee) => (
                <EmployeeCard 
                  key={employee.id}
                  employee={employee}
                  isBookmarked={bookmarks.some(b => b.id === employee.id)}
                  onBookmark={handleBookmark}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}