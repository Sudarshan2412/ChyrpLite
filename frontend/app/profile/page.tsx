import React from 'react';

export default function ProfilePage() {
  // TODO: Fetch user profile data from API
  // TODO: Add edit profile functionality for the logged-in user
  // TODO: Show avatar, username, bio, and other info
  // TODO: Add upload avatar feature
  // TODO: Add list of user's posts/comments
  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <div className="bg-white dark:bg-neutral-900 rounded shadow p-6 flex flex-col items-center">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-neutral-200 dark:bg-neutral-800 mb-4" />
        {/* Username */}
        <div className="text-lg font-semibold mb-2">@username</div>
        {/* Bio */}
        <div className="text-neutral-600 dark:text-neutral-300 mb-4 text-center">User bio goes here...</div>
        {/* Edit button (only for own profile) */}
        <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Edit Profile</button>
      </div>
      {/* User's posts/comments list placeholder */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Recent Posts</h2>
        <div className="text-neutral-500">(User's posts will appear here)</div>
      </div>
    </main>
  );
}
