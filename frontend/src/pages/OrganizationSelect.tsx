import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export default function OrganizationSelect() {
  const { token, setActiveOrganization, logout } = useAuth();
  const navigate = useNavigate();
  
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const { data: orgs, isLoading, refetch } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/organizations", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    enabled: !!token
  });

  const handleSelectOrg = (org: any) => {
    setActiveOrganization({ id: org.id, name: org.name });
    navigate("/");
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsCreating(true);

    try {
      await axios.post(
        "http://localhost:5000/api/organizations",
        { name: newOrgName, slug: newOrgSlug },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewOrgName("");
      setNewOrgSlug("");
      refetch();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create organization");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Select Organization */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Select Organization</h2>
          <p className="text-sm text-slate-500 mb-6">Choose a workspace to continue</p>
          
          {isLoading ? (
            <div className="animate-pulse flex flex-col gap-3">
              <div className="h-16 bg-slate-100 rounded-md"></div>
              <div className="h-16 bg-slate-100 rounded-md"></div>
            </div>
          ) : orgs?.length === 0 ? (
            <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-md text-slate-500">
              No organizations found. Create one to get started!
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
              {orgs?.map((org: any) => (
                <button
                  key={org.id}
                  onClick={() => handleSelectOrg(org)}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <div>
                    <div className="font-medium text-slate-900">{org.name}</div>
                    <div className="text-xs text-slate-500">Role: {org.members[0]?.role}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100">
            <button onClick={() => { logout(); navigate("/login"); }} className="text-sm text-slate-500 hover:text-slate-900">
              Sign out
            </button>
          </div>
        </div>

        {/* Create Organization */}
        <div className="bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-800 text-white flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-2">Create New Organization</h2>
          <p className="text-sm text-slate-400 mb-6">Start a new workspace for your team</p>
          
          {error && <div className="p-3 mb-4 text-sm text-red-400 bg-red-950/50 rounded-md border border-red-900">{error}</div>}

          <form onSubmit={handleCreateOrg} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Organization Name</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                value={newOrgName}
                onChange={(e) => {
                  setNewOrgName(e.target.value);
                  setNewOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Organization Slug (URL)</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-300"
                value={newOrgSlug}
                onChange={(e) => setNewOrgSlug(e.target.value)}
              />
            </div>
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Workspace"}
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
}
