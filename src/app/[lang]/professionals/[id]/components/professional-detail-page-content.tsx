'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import ProfessionalHeader from '@/features/professionals/components/sections/professional-header';
import ActionButtonsRow from '@/features/professionals/components/sections/action-buttons-row';
import ServicesSection from '@/features/professionals/components/sections/services-section';
import PortfolioGallery from '@/features/professionals/components/sections/portfolio-gallery';
import CompletedTasksSection from '@/features/professionals/components/sections/completed-tasks-section';
import ReviewsSection from '@/features/professionals/components/sections/reviews-section';
import { SuspensionBanner } from '@/components/safety/suspension-banner';
import { getCityLabelBySlug } from '@/features/cities';
import { formatResponseTime } from '@/lib/utils/pluralization';
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

// Consolidated UI state to reduce re-renders
interface UIState {
  isShareCopied: boolean;
  showAuthSlideOver: boolean;
  showTaskSelectionModal: boolean;
  isLoadingTasks: boolean;
  isSendingInvitation: boolean;
}

export function ProfessionalDetailPageContent({ professional, lang }: ProfessionalDetailPageContentProps) {
  const t = useTranslations();
  // Use lang prop from server component (or fallback to params)
  const currentLocale = lang || 'bg';
  const { user, authenticatedFetch } = useAuth();

  // Consolidated UI state - single setState for related UI changes
  const [uiState, setUIState] = useState<UIState>({
    isShareCopied: false,
    showAuthSlideOver: false,
    showTaskSelectionModal: false,
    isLoadingTasks: false,
    isSendingInvitation: false,
  });

  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [hasInvitedThisSession, setHasInvitedThisSession] = useState(false);

  // Ref for timeout cleanup
  const shareTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      try {
        const invitedIds = JSON.parse(invitedProfessionals);
        if (invitedIds.includes(professional.id)) {
          setHasInvitedThisSession(true);
        }
      } catch {
        // Invalid JSON in sessionStorage, ignore
      }
    }
  }, [professional.id]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (shareTimeoutRef.current) {
        clearTimeout(shareTimeoutRef.current);
      }
    };
  }, []);

  // Memoize transformed professional to prevent child re-renders
  const transformedProfessional = useMemo(() => ({
    id: professional.id,
    name: professional.fullName || professional.name,
    // Use professional_title as title, fallback to first service category or default
    title: professional.specialization || t('professionals.card.lookingForFirstTask'),
    avatar: professional.avatarUrl || professional.avatar,
    rating: professional.rating || 0,
    // Use reviewsCount from API (already filtered to published reviews only)
    reviewCount: professional.reviewsCount || professional.reviewCount || 0,
    completedTasks: professional.completedJobs || professional.completedTasks || 0,
    yearsExperience: professional.yearsExperience || 0,
    responseTime: formatResponseTime(professional.responseTimeHours, currentLocale, (key: string) => t(key as any)),
    // Show city if available, otherwise show "Bulgaria 🇧🇬" like on professional cards
    location: professional.city
      ? getCityLabelBySlug(professional.city, t)
      : `${t('common.country.bulgaria')} 🇧🇬`,
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
    bio: professional.bio || t('professionalDetail.defaultBio'),
    services: professional.services || [],
    serviceCategories: professional.serviceCategories || [],
    gallery: professional.gallery || [],
    reviews: professional.reviews || [],
    contactSettings: professional.contactSettings || {
      allowDirectContact: true,
      preferredHours: "9:00 - 18:00",
      contactMethods: ["message", "phone"]
    },
    completedTasksList: professional.completedTasksList || professional.completedTasks || [],
    // Badge fields
    isTopProfessional: professional.isTopProfessional || professional.is_top_professional || false,
    topProfessionalTasksCount: professional.topProfessionalTasksCount || professional.top_professional_tasks_count || 0,
    isEarlyAdopter: professional.isEarlyAdopter || professional.is_early_adopter || false,
    earlyAdopterCategories: professional.earlyAdopterCategories || professional.early_adopter_categories || []
  }), [professional, currentLocale, t]);

  // Memoized clipboard copy with proper timeout cleanup
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setUIState(prev => ({ ...prev, isShareCopied: true }));
      toast({ title: t('professionalDetail.linkCopied') });

      // Clear existing timeout if any
      if (shareTimeoutRef.current) {
        clearTimeout(shareTimeoutRef.current);
      }

      // Reset icon after 2 seconds with cleanup ref
      shareTimeoutRef.current = setTimeout(() => {
        setUIState(prev => ({ ...prev, isShareCopied: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: t('professionalDetail.copyError'),
        variant: 'destructive',
      });
    }
  }, [t]);

  const handleShareClick = useCallback(async () => {
    const professionalUrl = `${window.location.origin}/${lang}/professionals/${professional.id}`;
    const shareData = {
      title: transformedProfessional.name,
      text: t('professionalDetail.shareText'),
      url: professionalUrl,
    };

    // Try to use Web Share API (native on mobile)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({ title: t('professionalDetail.shareSuccess') });
      } catch (error: unknown) {
        // User cancelled or error occurred
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          // Fallback to clipboard
          await copyToClipboard(professionalUrl);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      await copyToClipboard(professionalUrl);
    }
  }, [lang, professional.id, transformedProfessional.name, t, copyToClipboard]);

  // Fetch user's open tasks via API - memoized
  const fetchUserTasks = useCallback(async (): Promise<{ tasks: any[]; error: string | null }> => {
    if (!user) return { tasks: [], error: null };

    setUIState(prev => ({ ...prev, isLoadingTasks: true }));
    try {
      const response = await authenticatedFetch('/api/tasks?mode=posted&status=open', {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { tasks: [], error: errorData.error || 'Failed to fetch tasks' };
      }

      const data = await response.json();
      return { tasks: data.tasks || [], error: null };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return { tasks: [], error: 'Network error. Please try again.' };
    } finally {
      setUIState(prev => ({ ...prev, isLoadingTasks: false }));
    }
  }, [user, authenticatedFetch]);

  // Handle invite button click - Implements all three branches - memoized
  const handleInviteClick = useCallback(async () => {
    // Check if user is trying to invite themselves (viewing own profile)
    if (user && user.id === professional.id) {
      toast({
        title: t('inviteModal.selfInviteTitle'),
        description: t('inviteModal.selfInviteDescription'),
        variant: 'default',
      });
      return;
    }

    // Check if already invited this session
    if (hasInvitedThisSession) {
      toast({
        title: t('inviteModal.alreadyInvitedProfessional'),
        description: t('inviteModal.alreadyInvitedProfessionalDescription', {
          defaultValue: 'You have already invited {{name}} to your task. They may apply within 24 hours if available.',
          name: transformedProfessional.name,
        }),
      });
      return;
    }

    // Branch C: Unauthenticated - Show login
    if (!user) {
      setUIState(prev => ({ ...prev, showAuthSlideOver: true }));
      return;
    }

    // Fetch tasks first to determine which flow to use
    const result = await fetchUserTasks();

    // Show error if fetch failed
    if (result.error) {
      toast({
        title: t('inviteModal.errorFetchingTasks'),
        description: result.error,
        variant: 'destructive',
      });
      return;
    }

    setUserTasks(result.tasks);

    // If user has no tasks, skip modal and go directly to create task
    // Use handleCreateTask to respect review enforcement
    if (result.tasks.length === 0) {
      handleCreateTask({
        inviteProfessionalId: professional.id,
        inviteProfessionalName: transformedProfessional.name,
      });
      return;
    }

    // If user has existing tasks, show the selection modal
    setUIState(prev => ({ ...prev, showTaskSelectionModal: true }));
  }, [user, professional.id, hasInvitedThisSession, transformedProfessional.name, t, fetchUserTasks, handleCreateTask]);

  // Handle task selection and send invitation - memoized
  const handleTaskSelection = useCallback(async (taskId: string) => {
    setUIState(prev => ({ ...prev, isSendingInvitation: true }));
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
            title: t('inviteModal.alreadyInvited'),
            description: t('inviteModal.alreadyInvitedDescription', {
              defaultValue: 'You have already invited {{name}} to this task.',
              name: transformedProfessional.name,
            }),
            variant: 'destructive',
          });
          setUIState(prev => ({ ...prev, showTaskSelectionModal: false }));
          return;
        }
        throw new Error(data.error || 'Failed to send invitation');
      }

      toast({
        title: t('inviteModal.success'),
        description: t('inviteModal.successDescription', {
          defaultValue: '{{name}} will be notified about your task.',
          name: transformedProfessional.name,
        }),
      });

      // Track in sessionStorage to prevent spam
      try {
        const invitedProfessionals = sessionStorage.getItem('invitedProfessionals');
        const invitedIds = invitedProfessionals ? JSON.parse(invitedProfessionals) : [];
        if (!invitedIds.includes(professional.id)) {
          invitedIds.push(professional.id);
          sessionStorage.setItem('invitedProfessionals', JSON.stringify(invitedIds));
        }
      } catch {
        // sessionStorage not available or parse error, ignore
      }
      setHasInvitedThisSession(true);

      setUIState(prev => ({ ...prev, showTaskSelectionModal: false }));
    } catch (error: unknown) {
      console.error('Error sending invitation:', error);
      toast({
        title: t('inviteModal.error'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setUIState(prev => ({ ...prev, isSendingInvitation: false }));
    }
  }, [authenticatedFetch, professional.id, transformedProfessional.name, t]);

  // Handle successful authentication - Resume invite flow
  useEffect(() => {
    if (user && uiState.showAuthSlideOver) {
      setUIState(prev => ({ ...prev, showAuthSlideOver: false }));
      // Re-trigger invite flow now that user is authenticated
      handleInviteClick();
    }
  }, [user, uiState.showAuthSlideOver, handleInviteClick]);

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
                isShareCopied={uiState.isShareCopied}
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

          {/* Work Gallery (Premium Feature) */}
          <PortfolioGallery gallery={transformedProfessional.gallery} />

          {/* Completed Tasks - Always show */}
          <CompletedTasksSection completedTasks={transformedProfessional.completedTasksList} />
        </div>
      </div>

      {/* Auth Slide-Over for unauthenticated users */}
      <AuthSlideOver
        isOpen={uiState.showAuthSlideOver}
        onClose={() => setUIState(prev => ({ ...prev, showAuthSlideOver: false }))}
        action={null}
      />

      {/* Task Selection Modal for users with existing tasks */}
      <TaskSelectionModal
        isOpen={uiState.showTaskSelectionModal}
        onClose={() => setUIState(prev => ({ ...prev, showTaskSelectionModal: false }))}
        tasks={userTasks}
        professionalName={transformedProfessional.name}
        onSelectTask={handleTaskSelection}
        onCreateNewTask={() => {
          setUIState(prev => ({ ...prev, showTaskSelectionModal: false }));
          // Use handleCreateTask to respect review enforcement while preserving professional context
          handleCreateTask({
            inviteProfessionalId: professional.id,
            inviteProfessionalName: transformedProfessional.name,
          });
        }}
        isLoading={uiState.isSendingInvitation}
        isLoadingTasks={uiState.isLoadingTasks}
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
