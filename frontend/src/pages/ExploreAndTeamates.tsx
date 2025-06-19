import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";

const ExploreAndTeammates: React.FC = () => {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showRecs, setShowRecs] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recHackathon, setRecHackathon] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: hackathonsData } = await supabase
        .from("hackathons")
        .select("*")
        .order("created_at", { ascending: false });
      setHackathons(hackathonsData || []);

      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      setProjects(projectsData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleFindTeammates = async (hackathon: any) => {
    setLoadingRecs(true);
    setShowRecs(true);
    setRecHackathon(hackathon);
    setRecommendations([]);
    try {
      const response = await fetch("http://127.0.0.1:8000/recommend-team-mates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hackathon_id: hackathon.id, poster_id: hackathon.user_id }),
      });
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      // optionally handle error
    } finally {
      setLoadingRecs(false);
    }
  };

  const myHackathons = user ? hackathons.filter(h => h.user_id === user.id) : [];
  const exploreHackathons = user ? hackathons.filter(h => h.user_id !== user.id) : hackathons;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 pt-20">
      <h1 className="text-3xl font-bold mb-2">Explore What's New</h1>
      <p className="mb-8 text-gray-300">
        Find hackathons and projects to join, or just see what others are working on.
      </p>

      {/* My Hackathons */}
      {user && (
        <>
          <h2 className="text-2xl font-bold mb-4">My Hackathons</h2>
          {loading ? (
            <div className="mb-8 text-gray-400">Loading...</div>
          ) : myHackathons.length === 0 ? (
            <div className="mb-8 text-gray-400">You haven't posted any hackathons yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
              {myHackathons.map((h) => (
                <div key={h.id} className="bg-dark-300/40 p-6 rounded-2xl hover:scale-105 transition-all flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-100 mb-1">{h.hackathon_name}</h3>
                    <div className="text-gray-400 text-sm">{h.location} • {h.date}</div>
                  </div>
                  <p className="text-gray-400 mb-4">{h.project_description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {h.skills_needed?.map((skill: string) => (
                      <span key={skill} className="bg-blue-900 text-blue-200 px-2 py-0.5 rounded text-xs">{skill}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <Button variant="secondary" onClick={() => handleFindTeammates(h)}>
                      Find Team Mates
                    </Button>
                    <Link to={`/hackathon/${h.id}`} className="text-electric-blue font-semibold hover:underline">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Explore Hackathons */}
      <h2 className="text-2xl font-bold mb-4">Explore Hackathons</h2>
      {loading ? (
        <div className="mb-8 text-gray-400">Loading...</div>
      ) : exploreHackathons.length === 0 ? (
        <div className="mb-8 text-gray-400">No hackathons to explore right now.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
          {exploreHackathons.map((h) => (
            <div key={h.id} className="bg-dark-300/40 p-6 rounded-2xl hover:scale-105 transition-all flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-100 mb-1">{h.hackathon_name}</h3>
                <div className="text-gray-400 text-sm">{h.location} • {h.date}</div>
              </div>
              <p className="text-gray-400 mb-4">{h.project_description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {h.skills_needed?.map((skill: string) => (
                  <span key={skill} className="bg-blue-900 text-blue-200 px-2 py-0.5 rounded text-xs">{skill}</span>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-auto">
                <Button variant="secondary" onClick={() => handleFindTeammates(h)}>
                  Find Team Mates
                </Button>
                <Link to={`/hackathon/${h.id}`} className="text-electric-blue font-semibold hover:underline">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Explore Projects */}
      <h2 className="text-2xl font-bold mb-4">Explore Projects</h2>
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="text-gray-400">No projects to explore right now.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div key={p.id} className="bg-dark-300/40 p-6 rounded-2xl hover:scale-105 transition-all flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-100 mb-1">{p.project_name}</h3>
                <div className="text-gray-400 text-sm">{new Date(p.created_at).toLocaleDateString()}</div>
              </div>
              <p className="text-gray-400 mb-4">{p.project_description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {p.required_skills?.map((skill: string) => (
                  <span key={skill} className="bg-blue-900 text-blue-200 px-2 py-0.5 rounded text-xs">{skill}</span>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-auto">
                <Link to={`/project/${p.id}`} className="text-electric-blue font-semibold hover:underline">
                  View Details
                </Link>
                <Button variant="secondary" onClick={() => alert("Find Teams feature coming soon!")}>
                  Find Teams
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations Modal */}
      {showRecs && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-dark-200 rounded-2xl p-8 max-w-4xl w-full relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setShowRecs(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-4">
              Recommended Teammates
              {recHackathon && (
                <span className="text-base text-gray-400 ml-2">
                  for <span className="font-semibold">{recHackathon.hackathon_name}</span>
                </span>
              )}
            </h2>

            {loadingRecs ? (
              <div className="grid place-items-center h-48">
                <div className="text-gray-400">Loading recommendations...</div>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec) => (
                  <div key={rec.user_id} className="bg-dark-300/40 p-6 rounded-2xl shadow-lg flex flex-col gap-3">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-electric-blue to-electric-teal flex items-center justify-center text-white font-bold">
                          {rec.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                          {rec.score}%
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{rec.email}</h3>
                        <div className="text-xs text-gray-400">Match Score: {rec.score}%</div>
                      </div>
                    </div>
                    <div className="text-gray-300 text-sm mb-2">{rec.explanation}</div>
                    <div className="mt-auto pt-2 border-t border-gray-700/50">
                      <a
                        href={`mailto:${rec.email}`}
                        className="w-full inline-flex items-center justify-center border border-electric-blue text-electric-blue rounded-lg py-2 px-4 hover:bg-electric-blue/10 transition"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Contact
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">No recommendations found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreAndTeammates;
