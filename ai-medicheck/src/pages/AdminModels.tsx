import React from 'react';

export default function AdminModels() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Manage AI Models</h1>
      <p>This page will show the status of all AI models.</p>
      {/* You would fetch data from /admin/ai-models/ here */}
    </div>
  );
}