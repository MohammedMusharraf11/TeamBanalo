import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const HackathonDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hackathon, setHackathon] = useState<any>(null);
  const [posterProfile, setPosterProfile] = useState<{ id: string; full_name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHackathonDetails = async () => {
      setLoading(true);
      const { data: hackathonData } = await supabase
        .from("hackathons")
        .select("*")
        .eq("id", id)
        .single();

      setHackathon(hackathonData);

      if (hackathonData?.user_id) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("id", hackathonData.user_id)
          .single();

        if (profileData) {
          setPosterProfile({
            id: profileData.id,
            full_name: profileData.full_name || "",
            email: profileData.email || "",
          });
        }
      }

      setLoading(false);
    };

    fetchHackathonDetails();
  }, [id]);

  if (loading) return <div className="text-center text-gray-400 mt-10">Loading...</div>;
  if (!hackathon) return <div className="text-center text-gray-400 mt-10">Hackathon not found</div>;

  const isUserPoster = user?.id === hackathon.user_id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 pt-20">
      <div
        onClick={() => navigate(-1)}
        className="flex items-center text-electric-blue mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </div>

      <h1 className="text-3xl font-bold mb-4 text-white">{hackathon.hackathon_name}</h1>
      <p className="text-gray-400 mb-2">{hackathon.location} • {hackathon.date}</p>
      <p className="text-gray-300 mb-6 leading-relaxed">{hackathon.project_description}</p>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-white">Skills Needed</h2>
        <div className="flex flex-wrap gap-2">
          {hackathon.skills_needed?.map((skill: string) => (
            <span key={skill} className="bg-blue-900 text-blue-200 px-2 py-0.5 rounded text-xs">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {posterProfile && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-white">Organizer Info</h2>
          {isUserPoster ? (
            <p className="text-gray-300 text-sm">You posted this hackathon.</p>
          ) : (
            <>
              <p className="text-gray-300 text-sm">
                Posted by:{" "}
                <span className="font-semibold text-white">{posterProfile.full_name}</span><br />
                Email:{" "}
                <a
                  href={`mailto:${posterProfile.email}`}
                  className="text-electric-blue underline"
                >
                  {posterProfile.email}
                </a>
              </p>
              <Link
                to={`/view-profile/${posterProfile.id}`} // ✅ Fixed dynamic link
                className="inline-block mt-2 text-sm text-electric-blue hover:underline"
              >
                View Organizer's Profile →
              </Link>
            </>
          )}
        </div>
      )}

      <Button variant="secondary">Apply / Join</Button>
    </div>
  );
};

export default HackathonDetail;