import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Github, Linkedin } from "lucide-react";

const ViewProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchProfile = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email, college, city, state, avatar_url, bio, skills, github_url, linkedin_url, team_size_pref, experience_level, hackathon_type, availability, resume_url")
      .eq("id", id)
      .single();
    setProfile(data);
    setLoading(false);
  };
  fetchProfile();
}, [id]);

  if (loading) return <div className="text-gray-400 text-center mt-20">Loading...</div>;
  if (!profile) return <div className="text-gray-400 text-center mt-20">Profile not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div
        className="flex items-center gap-3 text-electric-blue cursor-pointer mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </div>

      <div className="bg-dark-300 p-6 rounded-xl border border-gray-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{profile.full_name}</h1>
            <p className="text-gray-400 text-sm">{profile.email}</p>
            <p className="text-gray-400 text-sm">{profile.college} • {profile.city}, {profile.state}</p>
          </div>
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover mt-4 sm:mt-0"
            />
          )}
        </div>

        {profile.bio && <p className="text-gray-300 mt-6">{profile.bio}</p>}

        {/* Social Links */}
        <div className="flex items-center gap-4 mt-6">
          {profile.github_url && (
            <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-electric-blue flex items-center hover:underline">
              <Github className="w-4 h-4 mr-1" /> GitHub
            </a>
          )}
          {profile.linkedin_url && (
            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-electric-blue flex items-center hover:underline">
              <Linkedin className="w-4 h-4 mr-1" /> LinkedIn
            </a>
          )}
        </div>

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg text-white font-semibold mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="bg-electric-blue/20 text-electric-blue px-3 py-1 rounded-full text-xs font-medium shadow-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Preferences */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="text-gray-300">
            <span className="font-medium text-white">Preferred Team Size: </span>{profile.team_size_pref || "Not specified"}
          </div>
          <div className="text-gray-300">
            <span className="font-medium text-white">Experience Level: </span>{profile.experience_level || "Not specified"}
          </div>
          <div className="text-gray-300">
            <span className="font-medium text-white">Hackathon Type: </span>{profile.hackathon_type || "Not specified"}
          </div>
          <div className="text-gray-300">
            <span className="font-medium text-white">Availability: </span>{profile.availability || "Not specified"}
          </div>
        </div>

        {/* Resume */}
        {profile.resume_url && (
          <div className="mt-6">
            <a
              href={profile.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric-blue hover:underline"
            >
              View Resume
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewProfile;