"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { User } from "./UserCart";

export interface UserDetail extends User {
  joinedAt: string;
  bio: string;
  lastSeen: string;
}

interface UserDetailModalProps {
  isOpen: boolean;
  userId: string | null;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  userId,
  onClose,
  triggerRef,
}) => {
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch user details
  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchUserDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        setUserDetail(null);

        // Simulate async delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 500));

        const res = await fetch("/users.json");
        if (!res.ok) throw new Error("Failed to fetch user data");

        const data: { users: UserDetail[] } = await res.json();
        const user = data.users.find((u) => u.id === userId);

        if (!user) throw new Error("User not found");
        setUserDetail(user);
      } catch (err: any) {
        setError(err?.message || "Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetail();
  }, [isOpen, userId]);

   useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab") {
        const focusableElements = contentRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement;

        if (e.shiftKey) {
          if (activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // focus to close button
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

   const handleClose = useCallback(() => {
    onClose();
     setTimeout(() => {
      triggerRef?.current?.focus();
    }, 0);
  }, [onClose, triggerRef]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop  animation */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fadeIn"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal with slide-up animation */}
      <div
        ref={modalRef}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div
          ref={contentRef}
          className="bg-white w-full sm:w-96 sm:rounded-lg rounded-t-2xl shadow-2xl animate-slideUp sm:animate-scaleIn max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between p-6 bg-white border-b">
            <h1 id="modal-title" className="text-2xl font-bold text-gray-900">
              User Details
            </h1>
            <button
              ref={closeButtonRef}
              onClick={handleClose}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="Close modal"
              type="button"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6" id="modal-description">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Loading user details...</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">Error loading user</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <button
                  onClick={handleClose}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            )}

            {userDetail && (
              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex justify-center">
                  <img
                    src={userDetail.avatar}
                    alt={userDetail.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-lg"
                  />
                </div>

                {/* Name */}
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {userDetail.name}
                  </h2>
                </div>

                {/* Email */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email
                  </label>
                  <a
                    href={`mailto:${userDetail.email}`}
                    className="text-blue-600 hover:text-blue-800 break-all"
                  >
                    {userDetail.email}
                  </a>
                </div>

                {/* Bio */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bio
                  </label>
                  <p className="text-gray-700 leading-relaxed">
                    {userDetail.bio}
                  </p>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Joined Date
                    </label>
                      <p className="text-gray-700">
                      {new Date(userDetail.joinedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(userDetail.joinedAt).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Seen
                    </label>
                    <p className="text-gray-700">
                      {new Date(userDetail.lastSeen).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(userDetail.lastSeen).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetailModal;
