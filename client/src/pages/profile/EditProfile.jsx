import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { AuthContext } from '../../context/AuthContext';
import { updateProfile, updateUserAvatar, updateUserTopics, updateProfileVisibility } from '../../api/userApi';
import { getTopics, createTopic as createTopicApi } from '../../api/topicApi';
import ToggleSwitch from '../../components/ToggleSwitch';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { appLanguages, spokenLanguages } from '../../constants/languages';

const VisibilitySettings = ({ user, onUpdate }) => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState({
        bio: true,
        skills: true,
        achievements: true
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.profileVisibility) {
            setSettings(user.profileVisibility);
        }
    }, [user]);

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSaveVisibility = async () => {
        setLoading(true);
        try {
            await updateProfileVisibility(settings);
            onUpdate(); // Refetch user data in parent
            toast.success("Visibility settings updated!");
        } catch (error) {
            toast.error("Failed to update settings.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">{t('editProfile.visibilityTitle')}</h3>
            <p className="text-sm text-textSecondary mb-4">{t('editProfile.visibilitySubtitle')}</p>
            <div className="space-y-4">
                <ToggleSwitch label={t('editProfile.showBio')} checked={settings.bio} onChange={() => handleToggle('bio')} />
                <ToggleSwitch label={t('editProfile.showSkills')} checked={settings.skills} onChange={() => handleToggle('skills')} />
                <ToggleSwitch label={t('editProfile.showAchievements')} checked={settings.achievements} onChange={() => handleToggle('achievements')} />
            </div>
            <div className="flex justify-end mt-6">
                <Button onClick={handleSaveVisibility} disabled={loading}>
                    {loading ? t('editProfile.saving') : t('editProfile.saveVisibility')}
                </Button>
            </div>
        </div>
    );
};

const EditProfile = () => {
    const { user, refetchUser } = useContext(AuthContext);
    const { t, i18n } = useTranslation();
    const [formData, setFormData] = useState({ fullName: '', email: '', bio: '' });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // State for topic management
    const [allTopics, setAllTopics] = useState([]);
    const [teachInput, setTeachInput] = useState('');
    const [learnInput, setLearnInput] = useState('');
    const [topicsToTeach, setTopicsToTeach] = useState([]);
    const [topicsToLearn, setTopicsToLearn] = useState([]);
    const [teachLoading, setTeachLoading] = useState(false);
    const [learnLoading, setLearnLoading] = useState(false);
    
    // State for language settings
    const [preferredLanguage, setPreferredLanguage] = useState('en');
    const [languagesSpoken, setLanguagesSpoken] = useState([]);
    const [languageToAdd, setLanguageToAdd] = useState(spokenLanguages[0]);


    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                bio: user.bio || ''
            });
            setTopicsToTeach(user.topicsToTeach || []);
            setTopicsToLearn(user.topicsToLearn || []);
            setPreferredLanguage(user.preferredLanguage || 'en');
            setLanguagesSpoken(user.languagesSpoken || []);
            setAvatarPreview(user.avatar);
        }
    }, [user]);
    
    // Cleanup for avatar preview URL
    useEffect(() => {
        return () => {
            if (avatarPreview && avatarPreview.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);


    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await getTopics();
                setAllTopics(response.data);
            } catch (error) {
                console.error("Failed to fetch topics", error);
            }
        };
        fetchTopics();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
    };

    const addTopic = async (type) => {
        const inputVal = type === 'teach' ? teachInput : learnInput;
        const setInput = type === 'teach' ? setTeachInput : setLearnInput;
        if (!inputVal.trim()) return;

        const setTopicLoading = type === 'teach' ? setTeachLoading : setLearnLoading;
        setTopicLoading(true);
        setError('');

        try {
            // Call the API to either get an existing topic or create a new one.
            // The backend handles normalization (e.g., "react" -> "React.js").
            const response = await createTopicApi({ name: inputVal, category: 'User Submitted' });
            const topic = response.data;

            const list = type === 'teach' ? topicsToTeach : topicsToLearn;
            const setList = type === 'teach' ? setTopicsToTeach : setTopicsToLearn;

            if (!list.some(t => t._id === topic._id)) {
                setList([...list, topic]);
                toast.success(`'${topic.name}' added to your skills.`);

                // Also add to the global list for the datalist if it's new
                if (!allTopics.some(t => t._id === topic._id)) {
                    setAllTopics(prev => [...prev, topic].sort((a, b) => a.name.localeCompare(b.name)));
                }
            } else {
                toast.error(`'${topic.name}' is already in your list.`);
            }
            
            setInput('');
        } catch (err) {
            const errorMessage = err.response?.data?.message || `Failed to add skill "${inputVal}".`;
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setTopicLoading(false);
        }
    };

    const removeTopic = (topicId, type) => {
        if (type === 'teach') {
            setTopicsToTeach(topicsToTeach.filter(t => t._id !== topicId));
        } else {
            setTopicsToLearn(topicsToLearn.filter(t => t._id !== topicId));
        }
    };
    
    const handleAddLanguage = () => {
        if (languageToAdd && !languagesSpoken.includes(languageToAdd)) {
            setLanguagesSpoken([...languagesSpoken, languageToAdd]);
        }
    };

    const removeLanguage = (langToRemove) => {
        setLanguagesSpoken(languagesSpoken.filter(lang => lang !== langToRemove));
    };

    const handleLanguageChange = (e) => {
        setPreferredLanguage(e.target.value);
        i18n.changeLanguage(e.target.value);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const promises = [];
            const profileData = { 
                fullName: formData.fullName, 
                bio: formData.bio,
                preferredLanguage,
                languagesSpoken
            };
            promises.push(updateProfile(profileData));

            const topicIdsToTeach = topicsToTeach.map(t => t._id);
            const topicIdsToLearn = topicsToLearn.map(t => t._id);
            promises.push(updateUserTopics({ topicsToTeach: topicIdsToTeach, topicsToLearn: topicIdsToLearn }));

            await Promise.all(promises);
            
            if (avatarFile) {
                const avatarFormData = new FormData();
                avatarFormData.append('avatar', avatarFile);
                await updateUserAvatar(avatarFormData);
            }
            
            await refetchUser();
            toast.success("Profile updated successfully!");
            navigate('/profile');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
            toast.error(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };
    
    if (!user) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold text-textPrimary">{t('editProfile.title')}</h1>
      <form className="bg-surface p-8 rounded-lg shadow-md space-y-6" onSubmit={handleSubmit}>
        
        <div className="flex items-center space-x-6">
            <img 
                src={avatarPreview || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`} 
                alt="Avatar Preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-primary"
            />
            <div className="flex-grow">
                <label htmlFor="avatar" className="block text-sm font-medium text-textSecondary">{t('editProfile.avatar')}</label>
                <input id="avatar" name="avatar" type="file" onChange={handleFileChange} className="w-full text-sm mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-indigo-50 file:text-primary hover:file:bg-indigo-100"/>
            </div>
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-textSecondary">{t('editProfile.fullName')}</label>
          <input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-textSecondary">{t('editProfile.email')}</label>
          <input id="email" name="email" type="email" value={formData.email} disabled className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm bg-gray-100" />
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-textSecondary">{t('editProfile.bio')}</label>
          <textarea id="bio" name="bio" rows="4" value={formData.bio} onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"></textarea>
        </div>

        <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">{t('editProfile.uiLanguage')}</h3>
             <select value={preferredLanguage} onChange={handleLanguageChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                {appLanguages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
            </select>
        </div>

        <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">{t('editProfile.languagesSpoken')}</h3>
            <div className="flex mt-1">
                <select value={languageToAdd} onChange={(e) => setLanguageToAdd(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-primary focus:border-primary">
                    {spokenLanguages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                    ))}
                </select>
                <Button type="button" onClick={handleAddLanguage} className="rounded-l-none">{t('editProfile.add')}</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {languagesSpoken.map(lang => (
                    <span key={lang} className="bg-gray-200 text-textPrimary px-3 py-1 rounded-full text-sm flex items-center">
                        {lang}
                        <button type="button" onClick={() => removeLanguage(lang)} className="ml-2 text-gray-500 hover:text-gray-800 font-bold">&times;</button>
                    </span>
                ))}
            </div>
        </div>
        
        <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">{t('editProfile.manageSkills')}</h3>
            <div className="mb-4">
                <label htmlFor="teach-skills" className="block text-sm font-medium text-textSecondary">{t('editProfile.skillsToTeach')}</label>
                <div className="flex mt-1">
                    <input id="teach-skills" list="topics-list" value={teachInput} onChange={(e) => setTeachInput(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-primary focus:border-primary" />
                    <Button type="button" onClick={() => addTopic('teach')} className="rounded-l-none" disabled={teachLoading}>
                        {teachLoading ? 'Adding...' : t('editProfile.add')}
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {topicsToTeach.map(topic => (
                        <span key={topic._id} className="bg-primary text-white px-3 py-1 rounded-full text-sm flex items-center">
                            {topic.name}
                            <button type="button" onClick={() => removeTopic(topic._id, 'teach')} className="ml-2 text-indigo-200 hover:text-white font-bold">&times;</button>
                        </span>
                    ))}
                </div>
            </div>
            <div>
                <label htmlFor="learn-skills" className="block text-sm font-medium text-textSecondary">{t('editProfile.skillsToLearn')}</label>
                <div className="flex mt-1">
                    <input id="learn-skills" list="topics-list" value={learnInput} onChange={(e) => setLearnInput(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-primary focus:border-primary" />
                    <Button type="button" onClick={() => addTopic('learn')} variant="secondary" className="rounded-l-none" disabled={learnLoading}>
                         {learnLoading ? 'Adding...' : t('editProfile.add')}
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {topicsToLearn.map(topic => (
                        <span key={topic._id} className="bg-secondary text-white px-3 py-1 rounded-full text-sm flex items-center">
                            {topic.name}
                            <button type="button" onClick={() => removeTopic(topic._id, 'learn')} className="ml-2 text-green-200 hover:text-white font-bold">&times;</button>
                        </span>
                    ))}
                </div>
            </div>
            <datalist id="topics-list">
                {allTopics.map(topic => <option key={topic._id} value={topic.name} />)}
            </datalist>
             {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate('/profile')}>{t('editProfile.cancel')}</Button>
          <Button type="submit" disabled={loading}>{loading ? t('editProfile.saving') : t('editProfile.save')}</Button>
        </div>
      </form>

      <div className="bg-surface p-8 rounded-lg shadow-md">
        <VisibilitySettings user={user} onUpdate={refetchUser} />
      </div>
    </div>
  );
};

export default EditProfile;
