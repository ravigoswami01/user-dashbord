"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import UserCard, { User } from "./Component/UserCart";
import UserDetailModal from "./Component/UserDetailModal";
import UserStatusChart from "./Component/UserStatusChart";
import ThemeToggle from "./Component/ThemeToggle";

const Home: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filteringActive, setFilteringActive] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [sortBy, setSortBy] = useState<"name_asc" | "name_desc">("name_asc");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [triggerRef, setTriggerRef] = useState<React.RefObject<HTMLElement> | undefined>(undefined);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/users.json");
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data: { users: User[] } = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err?.message || "Unknown error");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Custom debounce  search
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setFilteringActive(true);
    setCurrentPage(1); 

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setSearch(value);
      setFilteringActive(false);
    }, 300);
  };

  // Reset pagination when filter or sort changes
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as any);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as any);
    setCurrentPage(1);
  };

  const filteredSorted = useMemo(() => {
    let list = users.slice();

    // Search
    const sea = search.trim().toLowerCase();
    if (sea) {
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(sea) ||
          u.email.toLowerCase().includes(sea) ||
          (u.bio || "").toLowerCase().includes(sea)
      );
    }

    // Filter
    if (statusFilter !== "All") {
      list = list.filter((u) => u.status === statusFilter);
    }

    // Sort
    list.sort((a, b) => {
      switch (sortBy) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return list;
  }, [users, search, statusFilter, sortBy]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredSorted.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredSorted.slice(startIndex, endIndex);

  // current page is valid
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleRetry = () => {
    fetchUsers();
  };

  const handleUserCardClick = (userId: string, ref: React.RefObject<HTMLElement>) => {
    setSelectedUserId(userId);
    setTriggerRef(ref);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Users Dashboard</h1>

      <div className="mb-6 flex flex-col bg-white text-gray-800 sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex gap-2 items-center flex-wrap w-full sm:w-auto">
          <div className="relative">
            <input
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name, email..."
              className="px-3 py-2 rounded border w-full sm:w-64"
            />
            {filteringActive && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <select value={statusFilter} onChange={(e) => handleStatusFilterChange(e.target.value)} className="px-3 py-2 rounded border text-sm">
             <option value="All">All</option>
             <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)} className="px-3 py-2 rounded border text-sm">
            <option value="name_asc">Name A→Z</option>
            <option value="name_desc">Name Z→A</option>
          </select>
        </div>

        <div className="flex items-center gap-2 pr-3 mt-3 sm:mt-0">
          <ThemeToggle />
        </div>
      </div>

      {/* main content */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 animate-pulse h-32" />
          ))}

        {!loading && error && (
          <div className="col-span-full bg-white p-6 rounded shadow text-center">
            <h2 className="text-lg font-semibold text-red-600">Something went wrong</h2>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
            <div className="mt-4 flex justify-center gap-2">
              <button onClick={handleRetry} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Retry</button>
            </div>
          </div>
        )}

        {!loading && !error && filteredSorted.length === 0 && (
          <div className="col-span-full bg-white p-6 rounded shadow text-center">
            <h2 className="text-lg font-semibold">No users found</h2>
            <p className="text-sm text-gray-600 mt-2">Try adjusting your search or filters.</p>
          </div>
        )}

        {!loading && !error && filteredSorted.length > 0 &&
          paginatedUsers.map((user) => (
            <UserCard 
              key={user.id} 
              user={user}
              onClick={handleUserCardClick}
            />
          ))}
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={isModalOpen}
        userId={selectedUserId}
        onClose={handleCloseModal}
        triggerRef={triggerRef}
      />

      {/* Pagination Controls */}
      {!loading && !error && filteredSorted.length > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white text-gray-800 p-4 rounded shadow">
          {/* Page Size Selector */}
          <div className="flex items-center gap-3">
            <label htmlFor="pageSize" className="text-sm font-medium text-gray-700">page size :</label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded border text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          {/* Page Info and Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded border bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
            >
              Previous
            </button>

            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Page {currentPage} of {totalPages}  
            </span>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded border bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
        {/* Charts Section */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2 pt-8">
        <UserStatusChart users={filteredSorted} loading={loading} />
       </div>
    </div>
    
  );
};

export default Home;
