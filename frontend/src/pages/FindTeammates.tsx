import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const FindTeammates: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Fetch all user profiles from the database
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, bio, skills')
        .neq('id', user?.id); // Exclude current user if logged in
      
      setProfiles(profilesData || []);
      setLoading(false);
    };
    
    fetchProfiles();
  }, [user]);

  // Filter profiles based on search query
  const filteredProfiles = profiles.filter(profile =>
    (profile.full_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (profile.skills?.join(',').toLowerCase() || '').includes(search.toLowerCase()) ||
    (profile.bio?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (profile.email?.toLowerCase() || '').includes(search.toLowerCase())
  );

  // Handle reaching out via email
  const handleReachOut = (email: string, name: string) => {
    const subject = encodeURIComponent(`Collaboration Opportunity - Let's team up!`);
    const body = encodeURIComponent(`Hi ${name},\n\nI found your profile and would love to discuss potential collaboration opportunities. Let's connect!\n\nBest regards`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  // Handle view profile navigation
  const handleViewProfile = (profile: any) => {
    navigate(`/view-profile/${profile.id}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pt-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Find Teammates</h1>
        <p className="text-gray-300">
          Discover talented individuals, explore their skills, and connect for your next project or hackathon.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <Input
          type="text"
          placeholder="Search by name, skills, bio, or email..."
          className="max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading teammates...</div>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="mb-6 text-gray-400">
            {filteredProfiles.length} teammate{filteredProfiles.length !== 1 ? 's' : ''} found
          </div>

          {/* Profile Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-dark-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-700 hover:border-electric-blue/50"
              >
                {/* Profile Header */}
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-electric-blue/20 rounded-full flex items-center justify-center mr-3">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-electric-blue" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-lg truncate">
                      {profile.full_name || 'Anonymous User'}
                    </h3>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Mail className="w-4 h-4 mr-1" />
                      <span className="truncate">{profile.email}</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div className="mb-4">
                    <p className="text-gray-300 text-sm line-clamp-3">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.slice(0, 4).map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="bg-electric-blue/20 text-electric-blue rounded-full px-3 py-1 text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {profile.skills.length > 4 && (
                        <span className="bg-gray-700 text-gray-300 rounded-full px-3 py-1 text-xs">
                          +{profile.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewProfile(profile)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Profile
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-electric-blue hover:bg-electric-teal"
                    onClick={() => handleReachOut(profile.email, profile.full_name)}
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    Reach Out
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProfiles.length === 0 && (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No teammates found</h3>
              <p className="text-gray-500">
                {search
                  ? 'Try adjusting your search criteria'
                  : 'No profiles available at the moment'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FindTeammates;