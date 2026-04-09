"use client";

import { useState, useEffect, useMemo } from "react";
import { JobListing } from "../../types/job";
import JobListingDetails from "./JobListingDetails";

interface ResumeSummary {
  id: string;
  name: string;
}

interface JobListingSidebarProps {
  resumes: ResumeSummary[];
  onApply: (listing: JobListing, resumeId: string, resumeName: string) => Promise<void>;
}

export default function JobListingSidebar({ resumes, onApply }: JobListingSidebarProps) {
  const [listings, setListings] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<JobListing | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await fetch("/api/jobs/listings");
        if (!res.ok) throw new Error("Failed to fetch listings");
        const data = await res.json();
        setListings(data);
      } catch (error) {
        console.error("Error fetching job listings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchListings();
  }, []);

  const filteredListings = useMemo(() => {
    if (!searchQuery.trim()) return listings;
    const q = searchQuery.toLowerCase();
    return listings.filter(
      (l) =>
        l.company.toLowerCase().includes(q) ||
        l.jobTitle.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
    );
  }, [listings, searchQuery]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(searchInput);
  }

  function handleClearSearch() {
    setSearchInput("");
    setSearchQuery("");
  }

  return (
    <div className="flex flex-col w-72 shrink-0 rounded-xl border border-zinc-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50">
        <h3 className="text-sm font-semibold text-zinc-900">Job Listings</h3>
        <p className="text-[11px] text-zinc-400 mt-0.5">
          {filteredListings.length} of {listings.length} positions
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="px-3 py-2.5 border-b border-zinc-100">
        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search jobs…"
              className="w-full pl-7 pr-2 py-1.5 border border-zinc-300 rounded-md text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <button
            type="submit"
            className="px-2.5 py-1.5 text-xs font-medium text-white bg-zinc-900 rounded-md hover:bg-zinc-700 transition-colors shrink-0"
          >
            Search
          </button>
        </div>
        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="mt-1.5 text-[11px] text-blue-600 hover:text-blue-800 transition-colors"
          >
            Clear search
          </button>
        )}
      </form>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-5 w-5 text-zinc-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <p className="text-xs text-zinc-400">
              {searchQuery ? "No listings match your search" : "No listings available"}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {filteredListings.map((listing) => (
              <li key={listing.id}>
                <button
                  type="button"
                  onClick={() => setSelectedListing(listing)}
                  className="w-full text-left px-4 py-3 hover:bg-zinc-50 transition-colors group"
                >
                  <p className="text-sm font-medium text-zinc-900 truncate group-hover:text-blue-600 transition-colors">
                    {listing.company}
                  </p>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    {listing.jobTitle}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {listing.location}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Listing details dialog */}
      {selectedListing && (
        <JobListingDetails
          listing={selectedListing}
          resumes={resumes}
          onClose={() => setSelectedListing(null)}
          onApply={onApply}
        />
      )}
    </div>
  );
}
