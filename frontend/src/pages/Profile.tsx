import { supabase } from "@/integrations/supabase/client";
import React, { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  MapPin,
  GraduationCap,
  Upload,
  X,
  Plus,
  Save,
  Camera,
  FileText,
  Github,
  Linkedin,
} from "lucide-react";

const Profile: React.FC = () => {
  const { user, profile, updateProfile, uploadAvatar, uploadResume } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    email: profile?.email || "",
    college: profile?.college || "",
    city: profile?.city || "",
    state: profile?.state || "",
    bio: profile?.bio || "",
    skills: profile?.skills || [],
    team_size_pref: profile?.team_size_pref || "",
    experience_level: profile?.experience_level || "",
    hackathon_type: profile?.hackathon_type || "",
    availability: profile?.availability || "",
    github_url: profile?.github_url || "",
    linkedin_url: profile?.linkedin_url || "",
  });

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [newSkill, setNewSkill] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSave = async () => {
    try {
      await updateProfile({ ...formData });

      try {
        const response = await fetch(`http://127.0.0.1:8000/generate-summary/${user.id}`);
        if (!response.ok) {
          toast({
            title: "Profile updated",
            description: "Profile updated, but summary generation failed.",
            variant: "warning",
          });
          setIsEditing(false);
          return;
        }
      } catch {
        toast({
          title: "Profile updated",
          description: "Profile updated, but summary generation failed (network error).",
          variant: "warning",
        });
        setIsEditing(false);
        return;
      }

      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await uploadAvatar(file);
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been successfully updated.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await uploadResume(file);
      toast({
        title: "Resume uploaded",
        description: "Your resume has been successfully uploaded.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const skillSuggestions = [
    "React", "Node.js", "Python", "JavaScript", "TypeScript", "MongoDB",
    "PostgreSQL", "GraphQL", "AWS", "Docker", "Kubernetes", "Machine Learning",
    "Data Science", "UI/UX Design", "Figma", "Swift", "Kotlin", "Flutter",
    "React Native", "Vue.js", "Angular", "Django", "Flask", "Express.js", "Go",
    "Rust", "Java", "C++", "PHP"
  ];

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-100 to-dark-200 pt-20 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-100 to-dark-200 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Your Profile</h1>
            <p className="text-gray-400">
              {isEditing
                ? "Edit your information to get better teammate matches"
                : "Manage your profile and preferences"}
            </p>
          </div>

          <Button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className={isEditing ? "btn-electric" : "btn-ghost"}
            disabled={isUploading}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <User className="w-4 h-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar & Resume */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 rounded-2xl text-center">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 bg-electric-gradient rounded-full flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    profile.full_name?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                {isEditing && (
                  <>
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute bottom-2 right-2 w-10 h-10 bg-electric-blue rounded-full flex items-center justify-center hover:bg-electric-teal transition-colors"
                    >
                      <Camera className="w-5 h-5 text-white" />
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white">{profile.full_name}</h2>
              <p className="text-gray-400">{profile.email}</p>
              <p className="text-sm text-electric-blue mt-2">{profile.credits} credits</p>

              <div
                onClick={() => resumeInputRef.current?.click()}
                className="mt-6 border-2 border-dashed border-white/20 rounded-lg p-6 cursor-pointer hover:border-electric-blue transition-colors"
              >
                {profile.resume_url ? (
                  <>
                    <FileText className="w-8 h-8 text-electric-blue mx-auto mb-2" />
                    <p className="text-electric-blue text-sm mb-2">
                      {profile.resume_filename || "Resume uploaded"}
                    </p>
                    <p className="text-xs text-gray-500">Click to update resume</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm mb-2">Upload Resume</p>
                    <p className="text-xs text-gray-500">PDF (Max 10MB)</p>
                  </>
                )}
              </div>
              <input
                ref={resumeInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleResumeUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Info Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <div className="glass-card p-6 rounded-2xl space-y-6">
              <h3 className="text-xl font-bold text-white">Personal Information</h3>

              {/* Full name, email, college, city/state */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputWithIcon icon={User} name="full_name" value={formData.full_name} onChange={handleInputChange} disabled={!isEditing} label="Full Name" />
                <InputWithIcon icon={Mail} name="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} label="Email" />
                <InputWithIcon icon={GraduationCap} name="college" value={formData.college} onChange={handleInputChange} disabled={!isEditing} label="College/University" />
                <div className="flex gap-3">
                  <InputWithIcon icon={MapPin} name="city" value={formData.city} onChange={handleInputChange} disabled={!isEditing} placeholder="City" />
                  <Input name="state" value={formData.state} onChange={handleInputChange} disabled={!isEditing} placeholder="State" className="input-dark" />
                </div>
                <InputWithIcon icon={Github} name="github_url" value={formData.github_url} onChange={handleInputChange} disabled={!isEditing} label="GitHub Profile" />
                <InputWithIcon icon={Linkedin} name="linkedin_url" value={formData.linkedin_url} onChange={handleInputChange} disabled={!isEditing} label="LinkedIn Profile" />
              </div>

              <div>
                <Label className="text-white mb-2 block">Bio</Label>
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  className="input-dark min-h-[100px]"
                />
              </div>
            </div>

            {/* Skills */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-6">Skills & Technologies</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.skills.map((skill, idx) => (
                  <span key={idx} className="bg-electric-blue/20 text-electric-blue px-3 py-1 rounded-full text-sm flex items-center">
                    {skill}
                    {isEditing && (
                      <button onClick={() => handleRemoveSkill(skill)} className="ml-2 hover:text-red-400 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditing && (
                <>
                  <div className="flex gap-3">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="input-dark"
                      placeholder="Add a skill (e.g., React)"
                      onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                    />
                    <Button onClick={handleAddSkill} className="btn-electric" disabled={!newSkill.trim()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">Suggestions:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skillSuggestions
                      .filter((s) => !formData.skills.includes(s))
                      .slice(0, 10)
                      .map((skill, idx) => (
                        <button
                          key={idx}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              skills: [...prev.skills, skill],
                            }))
                          }
                          className="bg-white/5 hover:bg-electric-blue/20 text-gray-300 hover:text-electric-blue px-3 py-1 rounded-full text-sm"
                        >
                          + {skill}
                        </button>
                      ))}
                  </div>
                </>
              )}
            </div>

            {/* Hackathon Preferences */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-6">Hackathon Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: "team_size_pref", label: "Preferred Team Size", options: ["2-3", "4-5", "6+", "No preference"] },
                  { name: "experience_level", label: "Experience Level", options: ["Beginner", "Intermediate", "Advanced"] },
                  { name: "hackathon_type", label: "Hackathon Type", options: ["In-person", "Virtual", "Both"] },
                  { name: "availability", label: "Availability", options: ["Weekends only", "Weekdays", "Both"] },
                ].map(({ name, label, options }) => (
                  <div key={name}>
                    <Label className="text-white mb-2 block">{label}</Label>
                    <select
                      className="input-dark w-full"
                      name={name}
                      value={(formData as any)[name]}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    >
                      <option value="">Select</option>
                      {options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component
const InputWithIcon = ({
  icon: Icon,
  name,
  value,
  onChange,
  disabled,
  placeholder,
  label,
}: {
  icon: any;
  name: string;
  value: string;
  onChange: any;
  disabled: boolean;
  placeholder?: string;
  label?: string;
}) => (
  <div>
    {label && <Label className="text-white mb-2 block">{label}</Label>}
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <Input
        name={name}
        value={value}
        onChange={onChange}
        className="input-dark pl-11"
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  </div>
);

export default Profile;
