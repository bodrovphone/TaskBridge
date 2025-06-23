import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  Phone, 
  Mail, 
  Calendar,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  ImageIcon,
  User
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { bg } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertApplicationSchema, insertReviewSchema, TASK_CATEGORIES } from "@shared/schema";
import { z } from "zod";

const applicationFormSchema = insertApplicationSchema.omit({
  taskId: true,
  professionalId: true,
});

const reviewFormSchema = insertReviewSchema.omit({
  taskId: true,
  reviewerId: true,
  revieweeId: true,
  reviewerType: true,
});

type ApplicationFormData = z.infer<typeof applicationFormSchema>;
type ReviewFormData = z.infer<typeof reviewFormSchema>;

export default function TaskDetails() {
  const params = useParams();
  const taskId = params.id;
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized", 
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch task details
  const { data: task, isLoading: taskLoading, error: taskError } = useQuery({
    queryKey: [`/api/tasks/${taskId}`],
    enabled: !!taskId && isAuthenticated,
  });

  // Fetch applications (only for task owner)
  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: [`/api/tasks/${taskId}/applications`],
    enabled: !!taskId && isAuthenticated && task?.customerId === user?.id,
  });

  // Fetch reviews
  const { data: reviews = [] } = useQuery({
    queryKey: [`/api/tasks/${taskId}/reviews`],
    enabled: !!taskId && isAuthenticated,
  });

  const applicationForm = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      proposedPrice: "",
      proposedTimeline: "",
      message: "",
      portfolioImages: [],
    },
  });

  const reviewForm = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      qualityRating: 5,
      timelinessRating: 5,
      communicationRating: 5,
      overallRating: 5,
      writtenReview: "",
    },
  });

  // Apply to task mutation
  const applyMutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      const response = await apiRequest("POST", `/api/tasks/${taskId}/applications`, {
        ...data,
        proposedPrice: parseFloat(data.proposedPrice),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Кандидатурата ви беше изпратена успешно!",
      });
      setShowApplicationDialog(false);
      applicationForm.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}/applications`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Грешка",
        description: "Неуспешно изпращане на кандидатура.",
        variant: "destructive",
      });
    },
  });

  // Accept application mutation
  const acceptMutation = useMutation({
    mutationFn: async ({ applicationId, professionalId }: { applicationId: string; professionalId: string }) => {
      // Update application status
      await apiRequest("PATCH", `/api/applications/${applicationId}`, { status: "accepted" });
      // Update task with selected professional
      await apiRequest("PATCH", `/api/tasks/${taskId}`, { 
        selectedProfessionalId: professionalId,
        status: "in_progress"
      });
    },
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Специалистът беше избран успешно! Контактната информация е споделена.",
      });
      setShowContactInfo(true);
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}/applications`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Грешка",
        description: "Неуспешно избиране на специалист.",
        variant: "destructive",
      });
    },
  });

  // Submit review mutation
  const reviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const response = await apiRequest("POST", `/api/tasks/${taskId}/reviews`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Отзивът беше изпратен успешно!",
      });
      setShowReviewDialog(false);
      reviewForm.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}/reviews`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Грешка",
        description: "Неуспешно изпращане на отзив.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || taskLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (taskError || !task) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Задачата не беше намерена
                </h3>
                <p className="text-gray-600">
                  Задачата може да е била изтрита или нямате достъп до нея.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const isTaskOwner = task.customerId === user?.id;
  const isProfessional = user?.userType === "professional";
  const hasApplied = applications.some((app: any) => app.professionalId === user?.id);
  const isTaskCompleted = task.status === "completed";
  const canReview = isTaskCompleted && (isTaskOwner || task.selectedProfessionalId === user?.id);
  const canApply = !isTaskOwner && isProfessional && task.status === "open" && !hasApplied;

  const categoryName = TASK_CATEGORIES[task.category as keyof typeof TASK_CATEGORIES] || task.category;

  const formatBudget = () => {
    if (task.budgetType === "fixed" && task.budgetMax) {
      return `${task.budgetMax} лв`;
    } else if (task.budgetMin && task.budgetMax) {
      return `${task.budgetMin}-${task.budgetMax} лв`;
    } else if (task.budgetMin) {
      return `от ${task.budgetMin} лв`;
    } else if (task.budgetMax) {
      return `до ${task.budgetMax} лв`;
    }
    return "По договаряне";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "expired": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open": return "Отворена";
      case "in_progress": return "В процес";
      case "completed": return "Завършена";
      case "cancelled": return "Отказана";
      case "expired": return "Изтекла";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Task Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge className={getStatusColor(task.status)}>
                    {getStatusText(task.status)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true, locale: bg })}
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-4">{task.title}</h1>
                
                <div className="flex items-center space-x-2 mb-4">
                  <Badge variant="outline">{categoryName}</Badge>
                  {task.subcategory && <Badge variant="outline">{task.subcategory}</Badge>}
                </div>

                <p className="text-gray-700 leading-relaxed mb-6">{task.description}</p>

                {/* Task Photos */}
                {task.photos && task.photos.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Снимки</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {task.photos.map((photo: string, index: number) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Task photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90"
                          onClick={() => window.open(photo, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {task.requirements && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Специални изисквания</h3>
                    <p className="text-gray-600">{task.requirements}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  {canApply && (
                    <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
                      <DialogTrigger asChild>
                        <Button className="bg-primary-500 hover:bg-primary-600">
                          Кандидатствай за задачата
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Кандидатствай за задача</DialogTitle>
                          <DialogDescription>
                            Изпратете предложение с цена и срок за изпълнение
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...applicationForm}>
                          <form onSubmit={applicationForm.handleSubmit((data) => applyMutation.mutate(data))} className="space-y-4">
                            <FormField
                              control={applicationForm.control}
                              name="proposedPrice"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Предлагана цена (лв) *</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" placeholder="100" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={applicationForm.control}
                              name="proposedTimeline"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Предлаган срок *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="2-3 дни" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={applicationForm.control}
                              name="message"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Съобщение</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Кратко описание на подхода ви и опита..."
                                      className="min-h-[100px]"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end space-x-2">
                              <Button type="button" variant="outline" onClick={() => setShowApplicationDialog(false)}>
                                Отказ
                              </Button>
                              <Button type="submit" disabled={applyMutation.isPending}>
                                {applyMutation.isPending ? "Изпращане..." : "Изпрати кандидатура"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  )}

                  {canReview && (
                    <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Star className="mr-2" size={16} />
                          Оцени работата
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Оценете работата</DialogTitle>
                          <DialogDescription>
                            Споделете мнението си за изпълнението на задачата
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...reviewForm}>
                          <form onSubmit={reviewForm.handleSubmit((data) => reviewMutation.mutate(data))} className="space-y-4">
                            <FormField
                              control={reviewForm.control}
                              name="qualityRating"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Качество на работата</FormLabel>
                                  <Select value={field.value.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {[1, 2, 3, 4, 5].map((rating) => (
                                        <SelectItem key={rating} value={rating.toString()}>
                                          {rating} звезди
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={reviewForm.control}
                              name="timelinessRating"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Спазване на срокове</FormLabel>
                                  <Select value={field.value.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {[1, 2, 3, 4, 5].map((rating) => (
                                        <SelectItem key={rating} value={rating.toString()}>
                                          {rating} звезди
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={reviewForm.control}
                              name="communicationRating"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Комуникация</FormLabel>
                                  <Select value={field.value.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {[1, 2, 3, 4, 5].map((rating) => (
                                        <SelectItem key={rating} value={rating.toString()}>
                                          {rating} звезди
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={reviewForm.control}
                              name="overallRating"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Обща оценка</FormLabel>
                                  <Select value={field.value.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {[1, 2, 3, 4, 5].map((rating) => (
                                        <SelectItem key={rating} value={rating.toString()}>
                                          {rating} звезди
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={reviewForm.control}
                              name="writtenReview"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Писмен отзив</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Споделете мнението си..."
                                      className="min-h-[80px]"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end space-x-2">
                              <Button type="button" variant="outline" onClick={() => setShowReviewDialog(false)}>
                                Отказ
                              </Button>
                              <Button type="submit" disabled={reviewMutation.isPending}>
                                {reviewMutation.isPending ? "Изпращане..." : "Изпрати отзив"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Applications Section (for task owner) */}
            {isTaskOwner && applications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Кандидатури ({applications.length})</CardTitle>
                  <CardDescription>
                    Специалисти, които кандидатстват за вашата задача
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applications.map((application: any) => (
                      <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={application.professional?.profileImageUrl} />
                              <AvatarFallback>
                                {application.professional?.firstName?.[0] || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold">
                                {application.professional?.firstName} {application.professional?.lastName}
                              </h4>
                              {application.professional?.averageRating && (
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="text-sm text-gray-600">
                                    {Number(application.professional.averageRating).toFixed(1)}
                                    ({application.professional.totalReviews} отзива)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge className={application.status === "accepted" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {application.status === "pending" && "Чакащ"}
                            {application.status === "accepted" && "Приет"}
                            {application.status === "rejected" && "Отхвърлен"}
                          </Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{application.proposedPrice} лв</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{application.proposedTimeline}</span>
                          </div>
                        </div>

                        {application.message && (
                          <p className="text-gray-600 text-sm mb-3">{application.message}</p>
                        )}

                        {application.status === "pending" && task.status === "open" && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => acceptMutation.mutate({
                                applicationId: application.id,
                                professionalId: application.professionalId
                              })}
                              disabled={acceptMutation.isPending}
                            >
                              Избери специалиста
                            </Button>
                            <Button variant="outline" size="sm">
                              Виж профил
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Отзиви</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                        <div className="flex items-start space-x-3">
                          <Avatar>
                            <AvatarImage src={review.reviewer?.profileImageUrl} />
                            <AvatarFallback>
                              {review.reviewer?.firstName?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h5 className="font-semibold">
                                {review.reviewer?.firstName} {review.reviewer?.lastName}
                              </h5>
                              <Badge variant="outline">
                                {review.reviewerType === "customer" ? "Клиент" : "Специалист"}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 mb-2">
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium">{review.overallRating}/5</span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {format(new Date(review.createdAt), "dd MMM yyyy", { locale: bg })}
                              </span>
                            </div>
                            {review.writtenReview && (
                              <p className="text-gray-700">{review.writtenReview}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Info */}
            <Card>
              <CardHeader>
                <CardTitle>Детайли за задачата</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{task.city}</div>
                    {task.neighborhood && (
                      <div className="text-sm text-gray-600">{task.neighborhood}</div>
                    )}
                    {isTaskOwner && task.exactAddress && (
                      <div className="text-sm text-gray-600">{task.exactAddress}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{formatBudget()}</div>
                    <div className="text-sm text-gray-600">
                      {task.budgetType === "fixed" ? "Фиксирана цена" : "Ценови диапазон"}
                    </div>
                  </div>
                </div>

                {task.deadline && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium">
                        {format(new Date(task.deadline), "dd MMM yyyy", { locale: bg })}
                      </div>
                      <div className="text-sm text-gray-600">Краен срок</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">
                      {task.urgency === "same_day" && "Същия ден"}
                      {task.urgency === "within_week" && "В рамките на седмица"}
                      {task.urgency === "flexible" && "Гъвкав срок"}
                    </div>
                    <div className="text-sm text-gray-600">Спешност</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info (shown after professional is selected) */}
            {(showContactInfo || task.selectedProfessionalId) && task.status === "in_progress" && (
              <Card>
                <CardHeader>
                  <CardTitle>Контактна информация</CardTitle>
                  <CardDescription>
                    Свържете се директно за координация
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isTaskOwner ? (
                    <div>
                      <h4 className="font-semibold mb-2">Избран специалист</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">Име: [Ще бъде показано]</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">Телефон: [Ще бъде показан]</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">Имейл: [Ще бъде показан]</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-semibold mb-2">Клиент</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">Име: [Ще бъде показано]</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">Телефон: [Ще бъде показан]</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">Имейл: [Ще бъде показан]</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Контактната информация се споделя автоматично след избор на специалист
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>За клиента</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar>
                    <AvatarImage src={task.customer?.profileImageUrl} />
                    <AvatarFallback>
                      {task.customer?.firstName?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">
                      {task.customer?.firstName} {task.customer?.lastName?.[0]}.
                    </h4>
                    {task.customer?.averageRating && Number(task.customer.averageRating) > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">
                          {Number(task.customer.averageRating).toFixed(1)} 
                          ({task.customer.totalReviews} отзива)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Член от {format(new Date(task.customer?.createdAt || task.createdAt), "MMM yyyy", { locale: bg })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
