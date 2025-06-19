import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

const ProjectDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posterProfile, setPosterProfile] = useState<{ id: string; full_name: string; email: string } | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      const { data: projectData } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (projectData) {
        setProject(projectData);

        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("id", projectData.user_id)
          .single();

        if (profileData) {
          setPosterProfile({
            id: profileData.id,
            full_name: profileData.full_name || "Unknown",
            email: profileData.email || "",
          });
        }
      }

      setLoading(false);
    };

    fetchProject();
  }, [id]);

  if (loading) return <div className="text-gray-400 text-center mt-20">Loading...</div>;
  if (!project) return <div className="text-gray-400 text-center mt-20">Project not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div
        className="flex items-center gap-3 text-electric-blue cursor-pointer mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </div>

      <h1 className="text-4xl font-bold text-white mb-3">{project.project_name}</h1>
      <p className="text-gray-400 text-sm mb-6">
        Posted on {new Date(project.created_at).toLocaleDateString()}
      </p>

      {/* Organizer Info */}
      {posterProfile && (
        <div className="bg-dark-300 p-4 rounded-xl border border-gray-700/50 mb-6">
          <p className="text-sm text-gray-300">
  Posted by:{" "}
  <span className="text-white font-semibold">{posterProfile.full_name}</span> •
  <a
    href={`mailto:${posterProfile.email}`}
    className="text-electric-blue ml-1 hover:underline"
  >
    {posterProfile.email}
  </a>
</p>
<Link
  to={`/view-profile/${posterProfile.id}`}
  className="inline-block mt-2 text-sm text-electric-blue hover:underline"
>
  View Organizer's Profile →
</Link>

        </div>
      )}

      <p className="text-gray-300 leading-relaxed mb-6">{project.project_description}</p>

      {project.required_skills && project.required_skills.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg text-white font-semibold mb-2">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {project.required_skills.map((skill: string) => (
              <span
                key={skill}
                className="bg-electric-blue/20 text-electric-blue px-3 py-1 rounded-full text-xs font-medium shadow-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-electric-purple to-electric-blue text-white p-4 rounded-2xl shadow-xl animate-pulse hover:animate-none transition-all duration-500">
        🚀 Want to collaborate? Reach out to the creator and shoot your ideas!
      </div>
    </div>
  );
};

export default ProjectDetails;