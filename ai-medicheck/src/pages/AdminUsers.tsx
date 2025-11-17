import React, { useEffect, useState } from 'react';
import { api } from '@/lib/apiService';
import { Skeleton } from '@/components/ui/skeleton';
// You can add Table components here later

// Define the User type
interface User {
  id: number;
  username: string;
  email: string;
  user_type: "user" | "admin";
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/admin/users/')
      .then(setUsers)
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold md:text-2xl">Manage Users</h1>
      {/* This is where you will add your <Table> component 
        to display the list of all users.
      */}
      <pre className="p-4 bg-muted rounded">
        {JSON.stringify(users, null, 2)}
      </pre>
    </div>
  );
}