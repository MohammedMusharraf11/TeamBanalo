import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X,User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';


const FindTeammates: React.FC = () => {
  const { user } = useAuth();

  // For teammate search and modal
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [search, setSearch] = useState('');

  // For hackathon posting form
  const [searchFilters, setSearchFilters] = useState({
    hackathonName: '',
    date: '',
    location: '',
    projectDescription: '',
    skillsNeeded: '',
    teamSize: '4'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // For recommendations
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [postedHackathon, setPostedHackathon] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [showRecs, setShowRecs] = useState(false);

  // Fetch all users and their hackathon postings
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, bio, skills')
        .neq('id', user.id); // Exclude current user
      setProfiles(profilesData || []);
      setLoading(false);
    };
    if (user) fetchProfiles();
  }, [user]);

  // For teammate search
  const filteredProfiles = profiles.filter(profile =>
    (profile.full_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (profile.skills?.join(',').toLowerCase() || '').includes(search.toLowerCase()) ||
    (profile.bio?.toLowerCase() || '').includes(search.toLowerCase())
  );

  // Posting form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSearchFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Submit new hackathon
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);
    if (!user) {
      setSubmitError("You must be logged in to submit a hackathon project.");
      setIsSubmitting(false);
      return;
    }

    const insertData = {
      user_id: user.id,
      hackathon_name: searchFilters.hackathonName,
      date: searchFilters.date || null,
      location: searchFilters.location,
      team_size: Number(searchFilters.teamSize) || null,
      project_description: searchFilters.projectDescription,
      skills_needed: searchFilters.skillsNeeded
        ? searchFilters.skillsNeeded.split(',').map(s => s.trim()).filter(Boolean)
        : [],
    };

    const { error } = await supabase.from('hackathons').insert([insertData]);
    if (error) {
      setSubmitError("Failed to submit hackathon: " + error.message);
      setIsSubmitting(false);
      return;
    }

    setSubmitSuccess(true);
    setIsSubmitting(false);
    setShowPostForm(false);

    // Fetch the latest hackathon just posted by this user
    const { data: latestHackathon } = await supabase
      .from('hackathons')
      .select('id, user_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    setPostedHackathon(latestHackathon);
    setShowConfirmation(true);
  };

  // Recommendation API call
  const handleFindTeammates = async (hackathonId: string, posterId: string) => {
    setLoadingRecs(true);
    setShowRecs(true);
    setRecommendations([]);
    try {
      const response = await fetch("http://127.0.0.1:8000/recommend-team-mates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hackathon_id: hackathonId, poster_id: posterId }),
      });
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      // Optionally handle error
    } finally {
      setLoadingRecs(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-2">Find Teammates</h1>
      <p className="mb-6 text-gray-300">Browse users, see their skills and hackathon posts, and reach out to collaborate!</p>

      {/* Search Bar */}
      <Input
        type="text"
        placeholder="Search teammates by name, skill, or bio"
        className="mb-6"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* All Users */}
      {loading ? (
        <div>Loading teammates...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProfiles.map(profile => (
            <div key={profile.id} className="bg-dark-200 rounded-lg p-4 shadow">
              <div className="flex items-center mb-2">
                <User className="w-5 h-5 mr-2" />
                <span className="font-semibold">{profile.full_name}</span>
              </div>
              <div className="text-sm text-gray-400 mb-2">{profile.email}</div>
              <div className="text-gray-300 mb-2">{profile.bio}</div>
              <div className="flex flex-wrap gap-2 mb-2">
                {profile.skills?.map((skill: string) => (
                  <span key={skill} className="bg-electric-blue text-white rounded-full px-2 py-1 text-xs">{skill}</span>
                ))}
              </div>
              <Button size="sm" variant="secondary">
                Reach Out
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Floating button to post new hackathon */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-electric-blue hover:bg-electric-teal text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-200"
        onClick={() => setShowPostForm(true)}
        title="Post New Hackathon"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Modal for posting new hackathon */}
      {showPostForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-dark-200 rounded-2xl p-8 max-w-lg w-full relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setShowPostForm(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Post a Hackathon</h2>
            <div className="space-y-4">
              <Input
                name="hackathonName"
                value={searchFilters.hackathonName}
                onChange={handleInputChange}
                className="input-dark"
                placeholder="Hackathon Name"
              />
              <Input
                name="date"
                type="date"
                value={searchFilters.date}
                onChange={handleInputChange}
                className="input-dark"
                placeholder="Date"
              />
              <Input
                name="location"
                value={searchFilters.location}
                onChange={handleInputChange}
                className="input-dark"
                placeholder="Location"
              />
              <Input
                name="teamSize"
                value={searchFilters.teamSize}
                onChange={handleInputChange}
                className="input-dark"
                placeholder="Team Size"
              />
              <Textarea
                name="projectDescription"
                value={searchFilters.projectDescription}
                onChange={handleInputChange}
                className="input-dark"
                placeholder="Project Description"
              />
              <Textarea
                name="skillsNeeded"
                value={searchFilters.skillsNeeded}
                onChange={handleInputChange}
                className="input-dark"
                placeholder="Skills Needed (comma separated)"
              />
              <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Hackathon"}
              </Button>
              {submitSuccess && (
                <div className="text-green-400 mt-2">Hackathon posted!</div>
              )}
              {submitError && (
                <div className="text-red-400 mt-2">{submitError}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal with Find Team Mates Button */}
      {showConfirmation && postedHackathon && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-dark-200 rounded-2xl p-8 max-w-lg w-full relative">
            <h2 className="text-2xl font-bold text-white mb-6">Hackathon Posted!</h2>
            <p className="mb-4 text-white">Your hackathon has been posted successfully.</p>
            <Button
              onClick={() => handleFindTeammates(postedHackathon.id, postedHackathon.user_id)}
              className="w-full"
            >
              Find Team Mates
            </Button>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setShowConfirmation(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Recommendations Modal */}
      {showRecs && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-dark-200 rounded-2xl p-8 max-w-lg w-full relative">
            <h2 className="text-xl font-bold text-white mb-4">Recommended Teammates</h2>
            {loadingRecs ? (
              <div>Loading...</div>
            ) : recommendations.length > 0 ? (
              recommendations.map((rec) => (
                <div key={rec.user_id} className="mb-4 border-b border-gray-700 pb-2">
                  <div className="font-semibold text-white">
                    {rec.email} <span className="text-blue-400">(Score: {rec.score}%)</span>
                  </div>
                  <div className="text-gray-300 text-sm">{rec.explanation}</div>
                </div>
              ))
            ) : (
              <div className="text-gray-400">No recommendations found.</div>
            )}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setShowRecs(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindTeammates;
