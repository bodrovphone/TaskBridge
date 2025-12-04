'use client'

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import ProfessionalHeader from '@/features/professionals/components/sections/professional-header';
import ActionButtonsRow from '@/features/professionals/components/sections/action-buttons-row';
import ServicesSection from '@/features/professionals/components/sections/services-section';
// @todo POST-MVP: Re-enable portfolio gallery when feature is ready
// import PortfolioGallery from '@/features/professionals/components/sections/portfolio-gallery';
import CompletedTasksSection from '@/features/professionals/components/sections/completed-tasks-section';
import ReviewsSection from '@/features/professionals/components/sections/reviews-section';
import { SuspensionBanner } from '@/components/safety/suspension-banner';
import { getCityLabelBySlug } from '@/features/cities';
import { toast } from '@/hooks/use-toast';
import { TaskSelectionModal } from '@/components/modals/task-selection-modal';
import AuthSlideOver from '@/components/ui/auth-slide-over';
import { useAuth } from '@/features/auth';
import { useCreateTask } from '@/hooks/use-create-task';
import { ReviewEnforcementDialog } from '@/features/reviews';

interface ProfessionalDetailPageContentProps {
  professional: any; // @todo: Add proper type from API
  lang: string;
}

export function ProfessionalDetailPageContent({ professional, lang }: ProfessionalDetailPageContentProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, authenticatedFetch } = useAuth();
  const [isShareCopied, setIsShareCopied] = useState(false);
  const [showAuthSlideOver, setShowAuthSlideOver] = useState(false);
  const [showTaskSelectionModal, setShowTaskSelectionModal] = useState(false);
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);
  const [hasInvitedThisSession, setHasInvitedThisSession] = useState(false);

  const {
    handleCreateTask,
    showEnforcementDialog,
    setShowEnforcementDialog,
    blockType,
    blockingTasks,
    handleReviewTask
  } = useCreateTask();

  // Check sessionStorage on mount to see if user already invited this professional
  useEffect(() => {
    const invitedProfessionals = sessionStorage.getItem('invitedProfessionals');
    if (invitedProfessionals) {
      const invitedIds = JSON.parse(invitedProfessionals);
      if (invitedIds.includes(professional.id)) {
        setHasInvitedThisSession(true);
      }
    }
  }, [professional.id]);

  // Transform API data to match component expectations
  const transformedProfessional = {
    id: professional.id,
    name: professional.fullName || professional.name,
    // Use professional_title as title, fallback to first service category or default
    title: professional.specialization || t('professionals.card.lookingForFirstTask', 'Professional service provider'),
    avatar: professional.avatarUrl || professional.avatar,
    rating: professional.rating || 0,
    // Use reviewsCount from API (already filtered to published reviews only)
    reviewCount: professional.reviewsCount || professional.reviewCount || 0,
    completedTasks: professional.completedJobs || professional.completedTasks || 0,
    yearsExperience: professional.yearsExperience || 0,
    responseTime: professional.responseTime || "2 часа",
    // Show city if available, otherwise show "Bulgaria 🇧🇬" like on professional cards
    location: professional.city
      ? `${getCityLabelBySlug(professional.city, t)}${professional.neighborhood ? `, ${professional.neighborhood}` : ''}`
      : `${t('common.country.bulgaria', 'Bulgaria')} 🇧🇬`,
    isOnline: professional.isOnline || false,
    isVerified: {
      phone: professional.phoneVerified || false,
      id: professional.idVerified || professional.verified || false,
      address: professional.addressVerified || false
    },
    safetyStatus: professional.safetyStatus || {
      phoneVerified: professional.phoneVerified || false,
      profileComplete: true,
      policeCertificate: false,
      backgroundCheckPassed: false
    },
    bio: professional.bio || t('professionalDetail.defaultBio', 'Професионален специалист с опит в сферата.'),
    services: professional.services || [],
    portfolio: professional.portfolio || [],
    reviews: professional.reviews || [],
    contactSettings: professional.contactSettings || {
      allowDirectContact: true,
      preferredHours: "9:00 - 18:00",
      contactMethods: ["message", "phone"]
    },
    completedTasksList: professional.completedTasksList || professional.completedTasks || []
  };

  const handleShareClick = async () => {
    const professionalUrl = `${window.location.origin}/${lang}/professionals/${professional.id}`;
    const shareData = {
      title: transformedProfessional.name,
      text: t('professionalDetail.shareText', 'Check out this professional on Trudify'),
      url: professionalUrl,
    };

    // Try to use Web Share API (native on mobile)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({ title: t('professionalDetail.shareSuccess', 'Shared successfully!') });
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          // Fallback to clipboard
          await copyToClipboard(professionalUrl);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      await copyToClipboard(professionalUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsShareCopied(true);
      toast({ title: t('professionalDetail.linkCopied', 'Link copied to clipboard!') });

      // Reset icon after 2 seconds
      setTimeout(() => {
        setIsShareCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: t('professionalDetail.copyError', 'Failed to copy link'),
        variant: 'destructive',
      });
    }
  };

  // Fetch user's open tasks via API
  const fetchUserTasks = async () => {
    if (!user) return [];

    setIsLoadingTasks(true);
    try {
      const response = await authenticatedFetch('/api/tasks?mode=posted&status=open', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      return data.tasks || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Handle invite button click - Implements all three branches
  const handleInviteClick = async () => {
    // Check if user is trying to invite themselves (viewing own profile)
    if (user && user.id === professional.id) {
      toast({
        title: t('inviteModal.selfInviteTitle', '🤔 Nice try!'),
        description: t('inviteModal.selfInviteDescription', "You can't suggest a task to yourself. But we appreciate the creativity!"),
        variant: 'default',
      });
      return;
    }

    // Check if already invited this session
    if (hasInvitedThisSession) {
      toast({
        title: t('inviteModal.alreadyInvitedProfessional', 'Already invited'),
        description: t('inviteModal.alreadyInvitedProfessionalDescription', {
          defaultValue: 'You have already invited {{name}} to your task. They may apply within 24 hours if available.',
          name: transformedProfessional.name,
        }),
      });
      return;
    }

    // Branch C: Unauthenticated - Show login
    if (!user) {
      setShowAuthSlideOver(true);
      return;
    }

    // Fetch tasks first to determine which flow to use
    setIsLoadingTasks(true);
    const tasks = await fetchUserTasks();
    setUserTasks(tasks);
    setIsLoadingTasks(false);

    // If user has no tasks, skip modal and go directly to create task
    // Use handleCreateTask to respect review enforcement
    if (tasks.length === 0) {
      handleCreateTask({
        inviteProfessionalId: professional.id,
        inviteProfessionalName: transformedProfessional.name,
      });
      return;
    }

    // If user has existing tasks, show the selection modal
    setShowTaskSelectionModal(true);
  };

  // Handle task selection and send invitation
  const handleTaskSelection = async (taskId: string) => {
    setIsSendingInvitation(true);
    try {
      const response = await authenticatedFetch(`/api/professionals/${professional.id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle duplicate invitation error specifically
        if (data.error?.includes('already invited')) {
          toast({
            title: t('inviteModal.alreadyInvited', 'Already invited'),
            description: t('inviteModal.alreadyInvitedDescription', {
              defaultValue: 'You have already invited {{name}} to this task.',
              name: transformedProfessional.name,
            }),
            variant: 'destructive',
          });
          setShowTaskSelectionModal(false);
          return;
        }
        throw new Error(data.error || 'Failed to send invitation');
      }

      toast({
        title: t('inviteModal.success', 'Invitation sent!'),
        description: t('inviteModal.successDescription', {
          defaultValue: '{{name}} will be notified about your task.',
          name: transformedProfessional.name,
        }),
      });

      // Track in sessionStorage to prevent spam
      const invitedProfessionals = sessionStorage.getItem('invitedProfessionals');
      const invitedIds = invitedProfessionals ? JSON.parse(invitedProfessionals) : [];
      if (!invitedIds.includes(professional.id)) {
        invitedIds.push(professional.id);
        sessionStorage.setItem('invitedProfessionals', JSON.stringify(invitedIds));
      }
      setHasInvitedThisSession(true);

      setShowTaskSelectionModal(false);
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: t('inviteModal.error', 'Failed to send invitation'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSendingInvitation(false);
    }
  };

  // Handle successful authentication - Resume invite flow
  useEffect(() => {
    if (user && showAuthSlideOver) {
      setShowAuthSlideOver(false);
      // Re-trigger invite flow now that user is authenticated
      handleInviteClick();
    }
  }, [user, showAuthSlideOver]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Suspension Banner (if account is suspended) */}
          {professional.isSuspended && (
            <SuspensionBanner suspensionReason={professional.suspensionReason} />
          )}

          {/* Professional Header */}
          <ProfessionalHeader professional={transformedProfessional} />

          {/* Two Column Layout - Equal Height */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-stretch">
            {/* Left Column - Action Buttons + Services */}
            <div className="flex flex-col gap-8">
              <ActionButtonsRow
                professional={transformedProfessional}
                onInviteToApply={handleInviteClick}
                onShare={handleShareClick}
                isShareCopied={isShareCopied}
              />
              <ServicesSection services={transformedProfessional.services} />
            </div>

            {/* Right Column - About (Full Height) */}
            <div className="bg-white/80 rounded-2xl p-8 shadow-lg border border-gray-100 flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t('professionalDetail.about')}
              </h3>
              <p className="text-gray-700 leading-relaxed flex-1">
                {transformedProfessional.bio}
              </p>
            </div>
          </div>

          {/* Reviews & Ratings - Always show */}
          <div id="reviews-section">
            <ReviewsSection reviews={transformedProfessional.reviews} />
          </div>

          {/* @todo POST-MVP: Re-enable portfolio gallery when feature is ready */}
          {/* <PortfolioGallery portfolio={transformedProfessional.portfolio} /> */}

          {/* Completed Tasks - Always show */}
          <CompletedTasksSection completedTasks={transformedProfessional.completedTasksList} />
        </div>
      </div>

      {/* Auth Slide-Over for unauthenticated users */}
      <AuthSlideOver
        isOpen={showAuthSlideOver}
        onClose={() => setShowAuthSlideOver(false)}
        action={null}
      />

      {/* Task Selection Modal for users with existing tasks */}
      <TaskSelectionModal
        isOpen={showTaskSelectionModal}
        onClose={() => setShowTaskSelectionModal(false)}
        tasks={userTasks}
        professionalName={transformedProfessional.name}
        onSelectTask={handleTaskSelection}
        onCreateNewTask={() => {
          setShowTaskSelectionModal(false);
          // Use handleCreateTask to respect review enforcement while preserving professional context
          handleCreateTask({
            inviteProfessionalId: professional.id,
            inviteProfessionalName: transformedProfessional.name,
          });
        }}
        isLoading={isSendingInvitation}
        isLoadingTasks={isLoadingTasks}
      />

      {/* Review Enforcement Dialog */}
      <ReviewEnforcementDialog
        isOpen={showEnforcementDialog}
        onClose={() => setShowEnforcementDialog(false)}
        blockType={blockType}
        pendingTasks={blockingTasks}
        onReviewTask={handleReviewTask}
      />
    </div>
  );
}
